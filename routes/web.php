<?php

use App\Http\Controllers\HistoryController;
use App\Http\Controllers\FuelPricesController;
use App\Http\Controllers\HeatIndexController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect('/home');
});
Route::get('/home', function () {
    return Inertia::render('Home');
});
Route::get('/about', function () {
    return Inertia::render('About');
});
Route::get('/fuel-prices', FuelPricesController::class);
Route::match(['get', 'post'], '/heat-index', HeatIndexController::class);
Route::get('/history', function () {
    return redirect('/history/fuel-prices');
});
Route::get('/history/fuel-prices', [HistoryController::class, 'fuelPrices']);
Route::get('/history/heat-index', [HistoryController::class, 'heatIndex']);
Route::get('/about', function () {
    return Inertia::render('About');
});

Route::fallback(function () {
    return Inertia::render('NotFound')->toResponse(request())->setStatusCode(404);
});
