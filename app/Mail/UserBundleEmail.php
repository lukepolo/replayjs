<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class UserBundleEmail extends Mailable
{
    use Queueable, SerializesModels;

    private $bundlePath;

    /**
     * Create a new message instance.
     *
     * @param $bundlePath
     */
    public function __construct($bundlePath)
    {
        $this->bundlePath = $bundlePath;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->subject('Your User Data')->markdown('mail.user-bundle')
            ->attach($this->bundlePath);
    }
}
