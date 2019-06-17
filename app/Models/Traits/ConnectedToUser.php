<?php

namespace App\Models\Traits;

use Illuminate\Database\Eloquent\Builder;

trait ConnectedToUser
{
    /**
     * Boot the global scope.
     */
    protected static function bootConnectedToUser()
    {
        $userModels = isset(static::$userModel) ? static::$userModel : null;

        static::addGlobalScope('user', function (Builder $builder) use ($userModels) {
            if (auth()->check()) {
                if (empty(auth()->user()->current_team_id)) {
                    if (! empty($userModels)) {
                        // This means that model has a related table(s) that have the user id column on it
                        $builder->where(function ($builder) use ($userModels) {
                            foreach ((array) $userModels as $userModel) {
                                $builder->orWhereHas($userModel, function (Builder $builder) {
                                    $builder->where('user_id', auth()->user()->id);
                                });
                            }
                        });
                    } else {
                        $builder->where('user_id', auth()->user()->id);
                    }
                }
                // TODO - teams logic here
            }
        });
    }
}
