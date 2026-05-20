<?php

use App\Http\Controllers\ArimaxController;
use App\Http\Controllers\RfcController;
use App\Http\Controllers\RfrController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Home');
});
Route::get('/about', function () {
    return Inertia::render('About');
});
Route::get('/fuel-prices', function () {
    $fuelPrices = [];

    if (Schema::hasTable('fuel_prices')) {
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
    }

    return Inertia::render('TrackPrice', [
        'fuelPrices' => $fuelPrices,
    ]);
});

Route::get('/sample/arimax', ArimaxController::class);
Route::get('/sample/rfr', RfrController::class);
Route::get('/sample/rfc', RfcController::class);
