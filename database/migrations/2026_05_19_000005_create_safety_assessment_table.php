<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('safety_assessment', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->decimal('temperature', 8, 2);
            $table->decimal('humidity', 8, 2);
            $table->decimal('wind_speed', 8, 2);
            $table->string('age_range');
            $table->integer('exertion_level');
            $table->string('safety_label');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('safety_assessment');
    }
};
