<?php

namespace App\Jobs;

use ZipArchive;
use League\Csv\Writer;
use App\Models\User\User;
use App\Mail\UserBundleEmail;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Mail;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class UserDataBundle implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private $user;
    private $directory;

    /**
     * Create a new job instance.
     *
     * @param User $user
     */
    public function __construct(User $user)
    {
        $this->user = $user;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $this->user->load([

        ]);

        $this->directory = storage_path("gdpr/bundles/{$this->user->id}");
        $bundlePath = storage_path("gdpr/bundles/{$this->user->name}'s-data.zip");

        if (! File::isDirectory($this->directory)) {
            File::makeDirectory($this->directory, 0775);
        }

        $this->userData();

        $zip = new ZipArchive;
        if ($zip->open($bundlePath, ZipArchive::CREATE) === true) {
            foreach (File::allFiles($this->directory) as $file) {
                if ($file->isFile()) {
                    $zip->addFile($file->getPathname(), $file->getFilename());
                }
            }

            $zip->close();
        }

        File::deleteDirectory($this->directory);
        Mail::to($this->user->email)
            ->send(new UserBundleEmail($bundlePath));

        File::delete($bundlePath);

        $this->user->update([
            'last_bundle_download' => null
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | USER DATA
    |--------------------------------------------------------------------------
    */

    private function userData()
    {
        $this->createCSV('user', [
            'name',
            'email',
        ])->insertOne([
            'name' => $this->user->name,
            'email' => $this->user->email,
        ]);
    }

    /**
     * @param $type
     * @param $headers
     * @return Writer
     * @throws \League\Csv\CannotInsertRecord
     */
    private function createCSV($type, $headers)
    {
        $csv = Writer::createFromPath("{$this->directory}/$type.csv", 'w');
        $csv->insertOne($headers);
        return $csv;
    }
}
