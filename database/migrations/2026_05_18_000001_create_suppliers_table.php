<?php

use App\Enums\SupplierCategory;
use App\Enums\SupplierStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('suppliers', function (Blueprint $table): void {
            $table->id();
            $table->string('code', 40)->unique();
            $table->string('name', 160);
            $table->string('category')->default(SupplierCategory::DryGoods->value);
            $table->string('contact_person', 120)->nullable();
            $table->string('phone', 60)->nullable();
            $table->string('email', 160)->nullable();
            $table->string('city', 120)->nullable();
            $table->string('address', 255)->nullable();
            $table->string('payment_terms', 80)->nullable();
            $table->unsignedSmallInteger('lead_time_days')->default(1);
            $table->unsignedTinyInteger('rating')->default(3);
            $table->string('status')->default(SupplierStatus::Active->value);
            $table->text('notes')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['category', 'status']);
            $table->index(['city', 'status']);
            $table->index(['rating', 'lead_time_days']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('suppliers');
    }
};
