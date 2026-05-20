<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class FuelPricesController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $inputs = [
            'horizon' => 1,
            'n_lags' => 3,
            'refresh' => $request->boolean('refresh', false),
        ];

        $cacheKey = 'fuel_prices.prediction.horizon.1.n_lags.3';

        if ($inputs['refresh']) {
            Cache::forget($cacheKey);
        }

        $this->loadBridge();
        $result = Cache::rememberForever($cacheKey, function () use ($inputs) {
            return use_ml('arimax', $inputs['horizon'], $inputs['n_lags']);
        });

        $fuelPrices = DB::table('fuel_prices')
            ->select([
                'date',
                'price',
                'fuel_type',
                'exchange_rate_to_usd',
                'normal_supply_flag',
            ])
            ->orderBy('date')
            ->orderBy('fuel_type')
            ->orderBy('id')
            ->get()
            ->map(static function ($row): array {
                return [
                    'date' => (string) $row->date,
                    'price' => (float) $row->price,
                    'fuel_type' => (string) $row->fuel_type,
                    'exchange_rate_to_usd' => (float) $row->exchange_rate_to_usd,
                    'normal_supply_flag' => (bool) $row->normal_supply_flag,
                ];
            })
            ->all();

        return Inertia::render('FuelPrice', [
            'predictions' => $result,
            'fuelPrices' => $fuelPrices,
        ]);
    }

    private function loadBridge(): void
    {
        if (!function_exists('use_ml')) {
            require_once base_path('ml-algorithms/bridge.php');
        }
    }
}
