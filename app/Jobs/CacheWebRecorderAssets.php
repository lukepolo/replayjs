<?php

namespace App\Jobs;

use App\Services\AssetService;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class CacheWebRecorderAssets implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $data;
    public $assets = [];

    /**
     * Create a new job instance.
     *
     * @param $data
     */
    public function __construct($data)
    {
        $this->data = $data;
    }

    /**
     * Execute the job.
     *
     * @param AssetService $assetService
     * @return void
     */
    public function handle(AssetService $assetService)
    {
        if (isset($this->data->children)) {
            foreach ($this->data->children as $child) {
                $this->findNodeAssets($child);
            }
        }

        if (isset($this->data->addedOrMoved)) {
            foreach ($this->data->addedOrMoved as $childNode) {
                $this->findNodeAssets($childNode);
            }
        }

        if (isset($this->data->attributes)) {
            foreach ($this->data->attributes as $attributeNode) {
                $this->findNodeAssets($attributeNode);
            }
        }

        foreach ($this->assets as $asset) {
            if (preg_match("/^\/(?!\/)/", $asset)) {
                $assetService->cache($this->data->baseHref.$asset);
            }
        }
    }

    private function findNodeAssets($node)
    {
        if (isset($node->tagName)) {
            switch ($node->tagName) {
                case 'IMG':
                    if (isset($node->attributes->src)) {
                        $this->assets[] = $node->attributes->src;
                    }
                    break;
                case 'LINK':
                case 'STYLE':
                    if (isset($node->attributes->href)) {
                        $this->assets[] = $node->attributes->href;
                    }
                    break;
            }
        }

        if (isset($node->childNodes)) {
            foreach ($node->childNodes as $childNode) {
                $this->findNodeAssets($childNode);
            }
        }
    }
}
