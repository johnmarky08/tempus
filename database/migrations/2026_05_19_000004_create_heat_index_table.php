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
        Schema::create('heat_index', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->decimal('temperature', 8, 2);
            $table->decimal('humidity', 8, 2);
            $table->decimal('wind_speed', 8, 2);
            $table->decimal('heat_index', 8, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('heat_index');
    }
};
