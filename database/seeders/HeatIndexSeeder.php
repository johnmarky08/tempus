<?php

namespace Database\Seeders;

use App\Utils\HeatIndex;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;

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
            $values = array_filter($row, static fn($value) => $value !== null && $value !== '');
            if (empty($values)) {
                continue; // Skip empty rows
            }

            if (count($row) < 4) {
                continue;
            }

            $timestamp = is_numeric($row[0])
                ? Carbon::instance(ExcelDate::excelToDateTimeObject((float) $row[0]))
                : Carbon::parse((string) $row[0]);
            $temperature = (float) $row[1];
            $humidity = (float) $row[2];
            $windSpeed = (float) $row[3];

            DB::table('heat_index')->insert([
                'date' => $timestamp,
                'temperature' => $temperature,
                'humidity' => $humidity,
                'wind_speed' => $windSpeed,
                'heat_index' => HeatIndex::fromCelsius($temperature, $humidity),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->command->info('Heat index data seeded from XLSX successfully!');
    }
}
