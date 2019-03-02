<?php

namespace App\Http\Controllers\User;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\UserUpdateRequest;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        return response()->json($request->user());
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
//            if ($user->marketing) {
//                Newsletter::subscribeOrUpdate($user->email, [
//                    'FNAME' => $user->name,
//                ]);
//            }
//
//            if (! $user->marketing) {
//                Newsletter::unsubscribe($user->email);
//            }
        }

        if ($request->has('password')) {
            $user->password = \Hash::make($request->get('password'));
        }

        $user->save();

        return response()->json($user->fresh());
    }

//    /**
//     * @return \Illuminate\Http\JsonResponse
//     */
//    public function requestData()
//    {
//        $user = \Auth::user();
//        if ($user->last_bundle_download && $user->last_bundle_download->addDays(2) >= Carbon::now()) {
//            return response()->json('Your data is still processing, please wait till its been sent to you.', 500);
//        }
//
//        $user->update([
//            'last_bundle_download' => Carbon::now()
//        ]);
//
//        dispatch(new UserDataBundle(\Auth::user()));
//        return response()->json('OK');
//    }

    /**
     * @return \Illuminate\Http\JsonResponse
     * @throws \Exception
     */
    public function destroy()
    {
        \Auth::user()->delete();
        return response()->json('OK');
    }
}
