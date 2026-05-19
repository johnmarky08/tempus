<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class HeatIndexSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $xlsxFile = database_path('/../datasets/heat_index.xlsx');

        if (file_exists($xlsxFile)) {
            $this->seedFromExcel($xlsxFile);
        } else {
            $this->command->error('No heat index source file found');
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
            $this->command->warn('Heat index XLSX file has no rows to seed.');
            return;
        }

        array_shift($data); // Skip header row

        foreach ($data as $row) {
            if (empty(array_filter($row))) {
                continue; // Skip empty rows
            }

            DB::table('heat_index')->insert([
                'date' => $row[0],
                'temperature' => (float) $row[1],
                'humidity' => (float) $row[2],
                'wind_speed' => (float) $row[3],
                'heat_index' => (float) $row[4],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->command->info('Heat index data seeded from XLSX successfully!');
    }
}
