<?php

namespace App\Http\Controllers\Auth\Traits;

trait JwtAuthTrait
{
    /**
     * Get the token array structure.
     *
     * @param  string $token
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function respondWithToken($token)
    {
        return response('abc')
                    ->cookie('JWT', $token, 60, '/', '.replayjs.test', false, false);

        //
        //->json([
        //          'access_token' => $token,
        //        'token_type' => 'bearer',
        //      'expires_in' => auth()->factory()->getTTL() * 60
        // ])

        return response()->withCookie('JWT', $token, auth()->factory()->getTTL() * 60);
    }
}
