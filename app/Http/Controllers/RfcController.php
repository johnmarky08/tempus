<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class RfcController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $inputs = [
            'date' => (string) $request->query('date', now()->toDateString()),
            'temperature' => (float) $request->query('temperature', 34),
            'humidity' => (float) $request->query('humidity', 53),
            'wind_speed' => (float) $request->query('wind_speed', 16),
            'age_range' => (string) $request->query('age_range', '18-39'),
            'exertion_level' => (float) $request->query('exertion_level', 3),
            'run' => $request->boolean('run'),
        ];

        $result = null;
        $error = null;

        if ($inputs['run']) {
            try {
                $this->loadBridge();
                $result = use_ml(
                    'rfc',
                    $inputs['date'],
                    $inputs['temperature'],
                    $inputs['humidity'],
                    $inputs['wind_speed'],
                    $inputs['age_range'],
                    $inputs['exertion_level']
                );
            } catch (Throwable $exception) {
                $error = $exception->getMessage();
            }
        }

        return Inertia::render('samples/rfc', [
            'algorithm' => 'rfc',
            'inputs' => $inputs,
            'result' => $result,
            'error' => $error,
            'note' => 'Uses the safety_assessment database table and run=1 to execute Random Forest Classifier.',
        ]);
    }

    private function loadBridge(): void
    {
        if (!function_exists('use_ml')) {
            require_once base_path('ml-algorithms/bridge.php');
        }
    }
}
