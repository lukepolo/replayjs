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
Route::post('login', 'Auth\AuthController@login');
Route::post('logout', 'Auth\AuthController@logout');
Route::post('refresh', 'Auth\AuthController@refresh');
Route::post('register', 'Auth\RegisterController@register');

Route::get('asset', 'AssetController@index');

Route::group(['middleware' => [
    'auth:api',
],
], function () {
    Route::get('me', 'User\UserController@index');
    Route::put('me', 'User\UserController@update');
    Route::delete('me', 'User\UserController@destroy');
    Route::apiResource('sites', 'SiteController');
    Route::apiResource('sites.recordings', 'SiteRecordingController');
});

Route::group(['middleware' => [
  \Barryvdh\Cors\HandleCors::class,
]
], function() {
    Route::post('identify', 'GuestController@index');
});
