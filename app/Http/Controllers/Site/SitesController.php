<?php

namespace App\Http\Controllers\Site;

use App\Models\Site\Site;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class SitesController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return Site::get();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        return Site::create([
            'user_id' => $request->user()->id,
            'domain' => $request->get('domain')
        ]);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return Site::findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $site = Site::findOrFail($id);

        $site->update([
            'domain' => $request->get('domain'),
            'blocked_ips' => $request->get('blocked_ips'),
            'static_file_origin' => $request->get('static_file_origin'),
            'recording_options' => $request->get('recording_options'),
            'data_collection_options' => $request->get('data_collection_options'),
            'notification_settings' => $request->get('notification_settings'),
        ]);

        return $site;
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        return  Site::findOrFail($id)->delete();
    }
}
