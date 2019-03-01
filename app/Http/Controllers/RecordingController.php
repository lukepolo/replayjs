<?php

namespace App\Http\Controllers;

use App\Models\Recording;
use Illuminate\Http\Request;

class RecordingController extends Controller
{
    /**
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        return response()->json(Recording::all());
    }

    /**
     * @param Request $request
     * @param $recordingId
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request, $recordingId)
    {
        return response()->json(Recording::findOrFail($recordingId));
    }
}
