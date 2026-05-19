<?php

use App\Http\Controllers\ArimaxController;
use App\Http\Controllers\RfcController;
use App\Http\Controllers\RfrController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::get('/', function () {
    return Inertia::render('home');
});

Route::get('/sample/arimax', ArimaxController::class);
Route::get('/sample/rfr', RfrController::class);
Route::get('/sample/rfc', RfcController::class);
