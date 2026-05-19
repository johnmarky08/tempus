<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class ArimaxController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $inputs = [
            'horizon' => (int) $request->query('horizon', 7),
            'n_lags' => (int) $request->query('n_lags', 3),
            'run' => $request->boolean('run'),
        ];

        $result = null;
        $error = null;

        if ($inputs['run']) {
            try {
                $this->loadBridge();
                $result = use_ml('arimax', $inputs['horizon'], $inputs['n_lags']);
            } catch (Throwable $exception) {
                $error = $exception->getMessage();
            }
        }

        return Inertia::render('samples/arimax', [
            'algorithm' => 'arimax',
            'inputs' => $inputs,
            'result' => $result,
            'error' => $error,
            'note' => 'Uses the fuel_prices database table and run=1 to execute ARIMAX.',
        ]);
    }

    private function loadBridge(): void
    {
        if (!function_exists('use_ml')) {
            require_once base_path('ml-algorithms/bridge.php');
        }
    }
}
