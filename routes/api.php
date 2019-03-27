<?php


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Authentication / Register Routes...
Route::post('login', [\App\Http\Controllers\Auth\AuthController::class, 'login']);
Route::post('logout', [\App\Http\Controllers\Auth\AuthController::class, 'logout']);
Route::post('refresh', [\App\Http\Controllers\Auth\AuthController::class, 'refresh']);
Route::post('register', [\App\Http\Controllers\Auth\RegisterController::class, 'register']);

Route::get('asset', [\App\Http\Controllers\AssetController::class, 'index']);

Route::group(['middleware' => [
    'auth:api',
],
], function () {
    Route::get('me', [\App\Http\Controllers\User\UsersController::class, 'index']);
    Route::put('me', [\App\Http\Controllers\User\UsersController::class, 'update']);
    Route::delete('me', [\App\Http\Controllers\User\UsersController::class, 'destroy']);
    Route::apiResource('sites', "\\".\App\Http\Controllers\Site\SitesController::class);
    Route::apiResource('sites.guests', "\\".\App\Http\Controllers\Site\Guest\GuestsController::class);
    Route::apiResource('sites.guests.sessions', "\\".\App\Http\Controllers\Site\Guest\Session\SessionsController::class);
});

Route::group(['middleware' => [
  \Barryvdh\Cors\HandleCors::class,
]
], function () {
    Route::post('identify', [\App\Http\Controllers\Site\Guest\Session\IdentifyController::class, 'index']);
});
