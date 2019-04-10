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
            $table->bigIncrements('id');
            // TODO - polymorphic relationship for user / chat
            $table->integer('guest_chat_message_type_id')->unsigned()->nullable();
            $table->string('guest_chat_message_type');
            $table->timestamp('user_read')->nullable();
            $table->timestamp('guest_read')->nullable();
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
