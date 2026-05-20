<?php

use App\Http\Controllers\FuelPricesController;
use App\Http\Controllers\ArimaxController;
use App\Http\Controllers\RfcController;
use App\Http\Controllers\RfrController;
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

Route::get('/heat-index', function () {
    return Inertia::render('HeatIndex');
});
Route::get('/history', function () {
    return Inertia::render('History');
});
Route::get('/about', function () {
    return Inertia::render('About');
});





Route::get('/sample/arimax', ArimaxController::class);
Route::get('/sample/rfr', RfrController::class);
Route::get('/sample/rfc', RfcController::class);
