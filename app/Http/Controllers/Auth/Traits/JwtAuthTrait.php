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
        [$header, $payload, $signature] = preg_split("/\./", $token);
        return response()->json()
            ->cookie('signature', $signature, auth()->factory()->getTTL() * 60, '/', '.replayjs.test', false, true)
            ->cookie('token', "$header.$payload", 30, '/', '.replayjs.test', false, false);
    }
}
