<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class RfrController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $inputs = [
            'forecast_days' => (int) $request->query('forecast_days', 7),
            'run' => $request->boolean('run'),
        ];

        $result = null;
        $error = null;

        if ($inputs['run']) {
            try {
                $this->loadBridge();
                $result = use_ml('rfr', $inputs['forecast_days']);
            } catch (Throwable $exception) {
                $error = $exception->getMessage();
            }
        }

        return Inertia::render('samples/rfr', [
            'algorithm' => 'rfr',
            'inputs' => $inputs,
            'result' => $result,
            'error' => $error,
            'note' => 'Uses the heat_index database table and run=1 to execute Random Forest Regressor.',
        ]);
    }

    private function loadBridge(): void
    {
        if (!function_exists('use_ml')) {
            require_once base_path('ml-algorithms/bridge.php');
        }
    }
}
