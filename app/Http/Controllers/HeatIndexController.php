<?php

namespace App\Http\Controllers;

use App\Utils\HeatIndex;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class HeatIndexController extends Controller
{
    public function __invoke(Request $request): Response|JsonResponse
    {
        $inputs = [
            'age_range' => (string) $request->input('age_range', '0-3'),
            'exertion_level' => (float) $request->input('exertion_level', 0),
            'forecast_hours' => 7,
            'assess' => $request->boolean('assess', false),
        ];

        $this->syncArchiveDataIfNeeded();

        $rows = DB::table('heat_index')
            ->select(['date', 'temperature', 'humidity', 'wind_speed', 'heat_index'])
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->limit(7)
            ->get()
            ->reverse()
            ->values();

        if ($rows->isEmpty()) {
            return Inertia::render('HeatIndex', [
                'heatIndexData' => null,
            ]);
        }

        $history = $rows->map(function ($row): array {
            $date = Carbon::parse($row->date);

            return [
                'date' => $date->toDateTimeString(),
                'label' => $date->format('g A'),
                'temperature' => (float) $row->temperature,
                'humidity' => (float) $row->humidity,
                'wind_speed' => (float) $row->wind_speed,
                'heat_index' => (float) $row->heat_index,
            ];
        })->all();

        $latestReading = $history[count($history) - 1];
        $heatStateKey = $this->resolveHeatStateKey($latestReading['heat_index']);
        $heatHighlights = $this->safetyHighlightsForLabel($heatStateKey);

        $this->loadBridge();

        if ($inputs['assess'] && $request->expectsJson()) {
            $safetyPrediction = use_ml(
                'rfc',
                Carbon::parse($latestReading['date'])->toDateString(),
                $latestReading['temperature'],
                $latestReading['humidity'],
                $latestReading['wind_speed'],
                $inputs['age_range'],
                $inputs['exertion_level']
            );

            $safetyResult = data_get($safetyPrediction, 'result', []);
            $safetyLabel = (string) data_get($safetyResult, 'label', 'safe');

            return response()->json([
                'safetyPrediction' => $safetyResult,
                'safetyMeta' => $this->safetyMetaForLabel($safetyLabel),
                'safetyHighlights' => $this->safetyHighlightsForLabel($safetyLabel),
                'ageRange' => $inputs['age_range'],
                'exertionLevel' => $inputs['exertion_level'],
                'assess' => true,
            ]);
        }

        $forecastCacheKey = sprintf(
            'heat_index.rfr.%s.%d',
            $latestReading['date'],
            $inputs['forecast_hours']
        );

        $forecastResult = Cache::rememberForever($forecastCacheKey, function () use ($inputs) {
            return use_ml('rfr', $inputs['forecast_hours']);
        });

        $forecastRows = collect(data_get($forecastResult, 'forecasts', []))
            ->map(function ($row): array {
                $date = Carbon::parse($row['date']);

                return [
                    'date' => $date->toDateTimeString(),
                    'label' => $date->format('g A'),
                    'heat_index' => (float) $row['heat_index'],
                ];
            })
            ->values()
            ->all();

        $safetyResult = [];
        $safetyLabel = 'assessing';
        $safetyMeta = $this->safetyMetaForLabel($safetyLabel);
        $safetyHighlights = $this->safetyHighlightsForLabel($safetyLabel);

        if ($inputs['assess']) {
            $safetyPrediction = use_ml(
                'rfc',
                Carbon::parse($latestReading['date'])->toDateString(),
                $latestReading['temperature'],
                $latestReading['humidity'],
                $latestReading['wind_speed'],
                $inputs['age_range'],
                $inputs['exertion_level']
            );

            $safetyResult = data_get($safetyPrediction, 'result', []);
            $safetyLabel = (string) data_get($safetyResult, 'label', 'safe');
            $safetyMeta = $this->safetyMetaForLabel($safetyLabel);
            $safetyHighlights = $this->safetyHighlightsForLabel($safetyLabel);
        }

        $selectedPreset = [
            'id' => 'latest-heat-index',
            'stateKey' => $heatStateKey,
            'location' => 'Laguna, Philippines',
            'condition' => sprintf(
                'Updated %s',
                Carbon::parse($latestReading['date'])->format('l, F j, g:i A')
            ),
            'temperature' => $latestReading['temperature'],
            'humidity' => $latestReading['humidity'],
            'windSpeed' => $latestReading['wind_speed'],
            'heatIndexValue' => $latestReading['heat_index'],
            'heatIndexStateKey' => $heatStateKey,
            'recommendation' => $heatHighlights['recommendation'],
            'travel' => $heatHighlights['travel'],
            'healthTip' => $heatHighlights['tip'],
            'graphLabels' => array_map(static fn(array $row): string => $row['label'], $history),
            'graphValues' => array_map(static fn(array $row): float => $row['heat_index'], $history),
            'forecastLabels' => array_map(static fn(array $row): string => $row['label'], $forecastRows),
            'forecastValues' => array_map(static fn(array $row): float => $row['heat_index'], $forecastRows),
            'forecast' => array_map(static fn(array $row): float => $row['heat_index'], $forecastRows),
        ];

        return Inertia::render('HeatIndex', [
            'heatIndexData' => [
                'selectedPreset' => $selectedPreset,
                'safetyPrediction' => $safetyResult,
                'safetyMeta' => $safetyMeta,
                'safetyHighlights' => $safetyHighlights,
                'ageRange' => $inputs['age_range'],
                'exertionLevel' => $inputs['exertion_level'],
                'assess' => $inputs['assess'],
            ],
        ]);
    }

    private function loadBridge(): void
    {
        if (!function_exists('use_ml')) {
            require_once base_path('ml-algorithms/bridge.php');
        }
    }

    private function syncArchiveDataIfNeeded(): void
    {
        $latestRow = DB::table('heat_index')
            ->select(['date'])
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->first();

        $currentHour = Carbon::now('Asia/Manila')->startOfHour();

        if ($latestRow === null) {
            $this->refreshArchiveRange(
                $currentHour->copy()->startOfDay(),
                $currentHour
            );

            return;
        }

        $latestHour = Carbon::parse($latestRow->date, 'Asia/Manila')->startOfHour();

        if ($latestHour->equalTo($currentHour)) {
            return;
        }

        $this->refreshArchiveRange($latestHour->copy()->addHour(), $currentHour);
    }

    private function refreshArchiveRange(Carbon $startHour, Carbon $endHour): void
    {
        if ($startHour->greaterThan($endHour)) {
            return;
        }

        $response = Http::timeout(30)->get(
            'https://archive-api.open-meteo.com/v1/archive',
            [
                'latitude' => 14.0949,
                'longitude' => 121.3007,
                'start_date' => $startHour->toDateString(),
                'end_date' => $endHour->toDateString(),
                'hourly' => 'temperature_2m,relative_humidity_2m,wind_speed_100m',
                'timezone' => 'Asia/Manila',
            ]
        );

        if (! $response->successful()) {
            return;
        }

        $payload = $response->json();
        $hourly = is_array($payload) ? ($payload['hourly'] ?? []) : [];
        $times = is_array($hourly) ? ($hourly['time'] ?? []) : [];
        $temperatures = is_array($hourly) ? ($hourly['temperature_2m'] ?? []) : [];
        $humidities = is_array($hourly) ? ($hourly['relative_humidity_2m'] ?? []) : [];
        $windSpeeds = is_array($hourly) ? ($hourly['wind_speed_100m'] ?? []) : [];

        $rows = [];

        foreach ($times as $index => $time) {
            $readingTime = Carbon::parse((string) $time, 'Asia/Manila')->startOfHour();

            if ($readingTime->lessThan($startHour) || $readingTime->greaterThan($endHour)) {
                continue;
            }

            if (! isset($temperatures[$index], $humidities[$index], $windSpeeds[$index])) {
                continue;
            }

            $temperature = (float) $temperatures[$index];
            $humidity = (float) $humidities[$index];
            $windSpeed = (float) $windSpeeds[$index];

            $rows[] = [
                'date' => $readingTime->toDateTimeString(),
                'temperature' => $temperature,
                'humidity' => $humidity,
                'wind_speed' => $windSpeed,
                'heat_index' => HeatIndex::fromCelsius($temperature, $humidity),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        if (empty($rows)) {
            return;
        }

        DB::table('heat_index')->insert($rows);
    }

    private function resolveHeatStateKey(float $heatIndex): string
    {
        if ($heatIndex < 25) {
            return 'safe';
        }

        if ($heatIndex < 39) {
            return 'moderate';
        }

        if ($heatIndex < 46) {
            return 'high';
        }

        return 'extreme';
    }

    private function safetyMetaForLabel(string $label): array
    {
        return match ($label) {
            'safe' => [
                'key' => 'safe',
                'title' => 'LOW RISK',
                'label' => 'Safe',
                'tone' => 'safe',
                'accent' => '#33FF2F',
                'bg' => 'bg-[#33FF2F]/50',
                'border' => 'border-[#33FF2F]',
                'text' => 'text-[#33FF2F]',
                'icon' => 'check',
            ],
            'moderate' => [
                'key' => 'moderate',
                'title' => 'CAUTION',
                'label' => 'Moderate',
                'tone' => 'moderate',
                'accent' => '#009BFF',
                'bg' => 'bg-[#009BFF]/50',
                'border' => 'border-[#009BFF]',
                'text' => 'text-[#009BFF]',
                'icon' => 'shield',
            ],
            'high' => [
                'key' => 'high',
                'title' => 'HIGH ALERT',
                'label' => 'High',
                'tone' => 'high',
                'accent' => '#FF8400',
                'bg' => 'bg-[#FF8400]/30',
                'border' => 'border-[#FF8400]',
                'text' => 'text-[#FF8400]',
                'icon' => 'warning',
            ],
            'extreme' => [
                'key' => 'extreme',
                'title' => 'EXTREME CAUTION',
                'label' => 'Extreme',
                'tone' => 'extreme',
                'accent' => '#FF0000',
                'bg' => 'bg-[#FF0000]/50',
                'border' => 'border-[#FF0000]',
                'text' => 'text-[#FF0000]',
                'icon' => 'alert',
            ],
            default => [
                'key' => 'assessing',
                'title' => 'ASSESSING...',
                'label' => 'Assessing',
                'tone' => 'assessing',
                'accent' => '#94a3b8',
                'bg' => 'bg-slate-500/15',
                'border' => 'border-slate-400/50',
                'text' => 'text-slate-200',
                'icon' => 'pulse',
            ],
        };
    }

    private function safetyHighlightsForLabel(string $label): array
    {
        return match ($label) {
            'safe' => [
                'alert' => 'No immediate heat risk detected.',
                'recommendation' => 'Proceed with planned outdoor activities normally.',
                'travel' => 'Safe to travel at any hour.',
                'tip' => 'Maintain standard hydration levels.',
            ],
            'moderate' => [
                'alert' => 'Heat levels are rising; comfort may start to drop.',
                'recommendation' => 'Take short shade breaks and keep water nearby.',
                'travel' => 'Standard travel conditions, no restrictions.',
                'tip' => 'Drink water even before you feel thirsty.',
            ],
            'high' => [
                'alert' => 'Heat exposure is significant; reduce long outdoor periods.',
                'recommendation' => 'Move heavy tasks earlier in the day or later in the evening.',
                'travel' => 'Avoid non-essential outdoor travel between 12 PM - 4 PM.',
                'tip' => 'Watch for dizziness or nausea.',
            ],
            'extreme' => [
                'alert' => 'Extreme heat risk detected; outdoor strain can rise quickly.',
                'recommendation' => 'Limit time outside and move critical tasks indoors if possible.',
                'travel' => 'Avoid outdoor travel unless it is urgent.',
                'tip' => 'Check for confusion, rapid heartbeat, or faintness.',
            ],
            default => [
                'alert' => 'No immediate heat risk detected.',
                'recommendation' => 'Proceed with planned outdoor activities normally.',
                'travel' => 'Safe to travel at any hour.',
                'tip' => 'Maintain standard hydration levels.',
            ],
        };
    }
}
