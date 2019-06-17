<?php

namespace App\Http\Controllers\Auth;

use App\Models\User\User;
use Illuminate\Http\Request;
use App\SocialProviders\TokenData;
use App\Http\Controllers\Controller;
use App\Models\NotificationProvider;
use App\Models\User\UserLoginProvider;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User\UserNotificationProvider;
use App\Http\Controllers\Auth\Traits\JwtAuthTrait;

class OauthController extends Controller
{
    use JwtAuthTrait;

    const SLACK = 'slack';
    const GITHUB = 'github';

    private $authManager;
    private $authService;

    public static $notificationProviders = [
        self::SLACK,
    ];

    /**
     * Handles provider requests.
     *
     * @param $provider
     * @return mixed
     */
    public function newProvider($provider)
    {
        $scopes = null;

        $providerDriver = Socialite::driver($provider);

        switch ($provider) {
            case self::GITHUB:
                $providerDriver->scopes(['repo admin:repo_hook']);
                break;
            case self::SLACK:
                $providerDriver->scopes(['chat:write:bot', 'channels:write']);
                break;
        }

        return $providerDriver->redirect();
    }

    /**
     * Handles the request from the provider.
     *
     * @param Request $request
     * @param $provider
     * @return mixed
     * @throws \Exception
     */
    public function getHandleProviderCallback(Request $request, $provider)
    {
        try {
            switch ($provider) {
                case self::SLACK:
                    $tokenData = Socialite::driver($provider)->stateless()->getAccessTokenResponse($request->get('code'));
                    $newUserNotificationProvider = $this->saveNotificationProvider($provider, new TokenData($tokenData['access_token'], $tokenData['user_id']));
                    break;
                default:

                    $socialUser = Socialite::driver($provider)->stateless()->user();

                    // Make them a login provider
                    if (! auth()->user()) {
                        $userProvider = UserLoginProvider::withTrashed()
                            ->with('user')
                            ->has('user')
                            ->where('provider', $provider)
                            ->where('provider_id', $socialUser->getId())
                            ->first();

                        if (empty($userProvider)) {
                            $alreadyRegistered = User::where('email', $socialUser->getEmail())->first();

                            if (! empty($alreadyRegistered)) {
                                return response()->json('You have already registered with this email.', 500);
                            }

                            $newLoginProvider = $this->createLoginProvider($provider, $socialUser);
                            $newUserModel = $this->createUser($socialUser, $newLoginProvider);
                            auth()->login($newUserModel);
                        } else {
                            if ($userProvider->deleted_at) {
                                $userProvider->restore();
                            }

                            auth()->login($userProvider->user);
                        }
                    }
                    break;
            }
            return $this->respondWithToken(auth()->refresh());
        } catch (\Exception $e) {
            if (! empty($newLoginProvider)) {
                $newLoginProvider->delete();
            }

            if (! empty($newUserModel)) {
                $newUserModel->delete();
            }

            if (! empty($newUserRepositoryProvider)) {
                $newUserRepositoryProvider->delete();
            }

            if (! empty($newUserNotificationProvider)) {
                $newUserNotificationProvider->delete();
            }

            return response()->json($e->getMessage(), 500);
        }
    }

    /**
     * Creates a new user.
     *
     * @param $user
     * @param UserLoginProvider $userLoginProvider
     *
     * @return mixed
     * @throws \Exception
     */
    public function createUser($user, UserLoginProvider $userLoginProvider)
    {
        return User::create([
            'confirmed'              => true,
            'email'                  => $user->getEmail(),
            'user_login_provider_id' => $userLoginProvider->id,
            'name'                   => empty($user->getName()) ? $user->getEmail() : $user->getName(),
        ]);
    }

    /**
     * Disconnects a service provider.
     *
     * @param $providerType
     * @param int $serviceID
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getDisconnectService($providerType, int $serviceID)
    {
        // TODO - missing disconnects
        if (UserNotificationProvider::class == $providerType) {
            if (! empty($userNotificationProvider = auth()->user()->userNotificationProviders->where(
                'id',
                $serviceID
            )->first())
            ) {
                $userNotificationProvider->delete();
            }
        }
        return response();
    }

    /**
     * Creates a login provider.
     *
     * @param $provider
     * @param $socialUser
     *
     * @return mixed
     */
    private function createLoginProvider($provider, $socialUser)
    {
        $userLoginProvider = UserLoginProvider::withTrashed()->firstOrNew([
            'provider'    => $provider,
            'provider_id' => $socialUser->getId(),
        ]);

        $userLoginProvider->fill([
            'token'         => $socialUser->token,
            'expires_at'    => isset($socialUser->expiresIn) ? $socialUser->expiresIn : null,
            'refresh_token' => isset($socialUser->refreshToken) ? $socialUser->refreshToken : null,
            'token_secret'   => isset($socialUser->tokenSecret) ? $socialUser->tokenSecret : null,
        ]);

        $userLoginProvider->save();

        return $userLoginProvider;
    }

    /**
     * Saves the users notification provider.
     *
     * @param $provider
     * @param TokenData $tokenData
     *
     * @return mixed
     */
    private function saveNotificationProvider($provider, TokenData $tokenData)
    {
        $userNotificationProvider = UserNotificationProvider::withTrashed()->firstOrNew([
            'notification_provider_id' => NotificationProvider::where('provider_name', $provider)->first()->id,
            'provider_id'              => $tokenData->userID,
        ]);

        $userNotificationProvider->fill([
            'token'         => $tokenData->token,
            'user_id'       => auth()->user()->id,
            'expires_at'    => isset($tokenData->expiresIn) ? $tokenData->expiresIn : null,
            'refresh_token' => isset($tokenData->refreshToken) ? $tokenData->refreshToken : null,
            'token_secret'   => isset($tokenData->tokenSecret) ? $tokenData->tokenSecret : null,
        ]);

        $userNotificationProvider->save();

        $userNotificationProvider->restore();

        return $userNotificationProvider;
    }
}
