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
            ->cookie('signature', $signature, 'session', null, null, null, true)
            ->cookie('token', "$header.$payload", auth()->factory()->getTTL(), null, null, null, false);
    }
}
