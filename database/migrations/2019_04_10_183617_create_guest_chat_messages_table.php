<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateGuestChatMessagesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('guest_chat_messages', function (Blueprint $table) {
            $table->bigIncrements('id')->unsigned();
            $table->bigInteger('user')->unsigned();
            $table->bigInteger('guest_chat_id')->unsigned();
            $table->string('user_type');
            $table->string('message');
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
        Schema::dropIfExists('guest_chat_messages');
    }
}
