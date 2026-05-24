<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class HistoryController extends Controller
{
    public function fuelPrices(): Response
    {
        return Inertia::render('history/fuelPrice', [
            'rows' => $this->fuelPriceRows(),
        ]);
    }

    public function heatIndex(): Response
    {
        return Inertia::render('history/heatIndex', [
            'rows' => $this->heatIndexRows(),
        ]);
    }

    private function fuelPriceRows(): array
    {
        return DB::table('fuel_prices')
            ->select([
                'id',
                'date',
                'price',
                'fuel_type',
                'exchange_rate_to_usd',
                'normal_supply_flag',
            ])
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->get()
            ->map(static function ($row): array {
                return [
                    'id' => (int) $row->id,
                    'date' => (string) $row->date,
                    'price' => (float) $row->price,
                    'fuel_type' => (string) $row->fuel_type,
                    'exchange_rate_to_usd' => (float) $row->exchange_rate_to_usd,
                    'normal_supply_flag' => (bool) $row->normal_supply_flag,
                ];
            })
            ->all();
    }

    private function heatIndexRows(): array
    {
        return DB::table('heat_index')
            ->select([
                'id',
                'date',
                'temperature',
                'humidity',
                'wind_speed',
                'heat_index',
            ])
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->get()
            ->map(static function ($row): array {
                return [
                    'id' => (int) $row->id,
                    'date' => Carbon::parse($row->date)->toDateTimeString(),
                    'temperature' => (float) $row->temperature,
                    'humidity' => (float) $row->humidity,
                    'wind_speed' => (float) $row->wind_speed,
                    'heat_index' => (float) $row->heat_index,
                ];
            })
            ->all();
    }
}
