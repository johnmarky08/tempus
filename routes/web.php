<?php

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

Route::get('/fuel-history', function () {
    return Inertia::render('history/fuelPrice');
});
Route::get('/heat-history', function () {
    return Inertia::render('history/heatIndex');
});
Route::get('/about', function () {
    return Inertia::render('About');
});
