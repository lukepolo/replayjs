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
        // return response()->json([
        //         'access_token' => $token,
        //           'token_type' => 'bearer',
        //           'expires_in' => auth()->factory()->getTTL() * 60
        //       ]);

        [$header, $payload, $signature] = preg_split("/\./", $token);
        return response()->json()
            ->cookie('signature', $signature, 'session', '/', '.replayjs.test', false, true)
            ->cookie('token', "$header.$payload", auth()->factory()->getTTL(), '/', '.replayjs.test', false, false);
    }
}
