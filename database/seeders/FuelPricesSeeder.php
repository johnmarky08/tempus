<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class FuelPricesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $xlsxFile = database_path('/../datasets/fuel_prices.xlsx');

        if (file_exists($xlsxFile)) {
            $this->seedFromExcel($xlsxFile);
        } else {
            $this->command->error('No fuel prices source file found');
        }
    }

    /**
     * Seed data from XLSX file
     */
    private function seedFromExcel(string $filePath): void
    {
        $sheets = Excel::toArray([], $filePath);
        $data = $sheets[0] ?? [];

        if (empty($data)) {
            $this->command->warn('Fuel prices XLSX file has no rows to seed.');
            return;
        }

        array_shift($data); // Skip header row

        foreach ($data as $row) {
            if (empty(array_filter($row))) {
                continue; // Skip empty rows
            }

            DB::table('fuel_prices')->insert([
                'date' => $row[0],
                'price' => (float) $row[1],
                'fuel_type' => $row[2],
                'exchange_rate_to_usd' => (float) $row[3],
                'normal_supply_flag' => $this->toBoolean($row[4]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->command->info('Fuel prices seeded from XLSX successfully!');
    }

    private function toBoolean(mixed $value): bool
    {
        return filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? false;
    }
}
