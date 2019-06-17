<?php

namespace App\Http\Controllers\User;

use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Jobs\MakeUserBundle;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\User\UserUpdateRequest;
use Spatie\Newsletter\NewsletterFacade as NewsLetter;

class UsersController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        return $request->user();
    }

    /**
     * Update the specified resource in storage.
     *
     * @param UserUpdateRequest $request
     * @return \Illuminate\Http\Response
     */
    public function update(UserUpdateRequest $request)
    {
        $user = $request->user();

        $user->fill($request->validated());

        if ($request->has('marketing')) {
            if ($user->allow_marketing) {
                Newsletter::subscribeOrUpdate($user->email, [
                    'FNAME' => $user->name,
                ]);
            }

            if (! $user->allow_marketing) {
                Newsletter::unsubscribe($user->email);
            }
        }

        if ($request->has('password')) {
            $user->password = Hash::make($request->get('password'));
        }

        $user->save();

        return $user->fresh();
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function requestData(Request $request)
    {
        $user = $request->auth()->user();
        if ($user->last_bundle_download && $user->last_bundle_download->addDays(2) >= Carbon::now()) {
            return response()->json('Your data is still processing, please wait till its been sent to you.', 500);
        }

        $user->update([
            'last_bundle_download' => Carbon::now()
        ]);

        dispatch(new MakeUserBundle($user));
        return response()->json('OK');
    }

    /**
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Request $request)
    {
        return $request->user()->delete();
    }
}
