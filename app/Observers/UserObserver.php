<?php

namespace App\Observers;

use App\Models\User\User;
use Spatie\Newsletter\NewsletterFacade as NewsLetter;

class UserObserver
{
    /**
     * Listen to the User created event.
     *
     * @param User $user
     *
     * @return void
     */
    public function created(User $user)
    {
        //Newsletter::subscribeOrUpdate($user->email, [
//            'FNAME' => $user->name,
        //]);
    }
}
