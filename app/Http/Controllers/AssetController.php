<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\AssetService;

class AssetController extends Controller
{
    protected $assetService;

    /**
     * AssetController constructor.
     * @param AssetService $assetService
     */
    public function __construct(AssetService $assetService)
    {
        $this->assetService = $assetService;
    }

    /**
     * @param Request $request
     */
    public function index(Request $request)
    {
        $url = $request->input('url');

        $fileDetails = $this->assetService->getCached($url);

        if ($fileDetails) {
            foreach ($fileDetails['headers'] as $header) {
                header($header);
            }
            echo $fileDetails['file'];
        } else {
            header("HTTP/1.1 404 Not Found");
        }
        exit();
    }
}
