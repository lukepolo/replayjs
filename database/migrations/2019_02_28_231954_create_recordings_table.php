<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateRecordingsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('recordings', function (Blueprint $table) {
            $table->increments('id');
            $table->string('session');
            $table->string('user_name')->nullable();
            $table->integer('client_id')->nullable();
            $table->json('custom_data')->nullable();
            $table->string('user_agent')->nullable();
            $table->json('dom_changes')->nullable();
            $table->json('xhr_requests')->nullable();
            $table->json('mouse_clicks')->nullable();
            $table->json('scroll_events')->nullable();
            $table->json('mouse_movements')->nullable();
            $table->json('window_size_changes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('recordings');
    }
}