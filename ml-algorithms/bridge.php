<?php

declare(strict_types=1);

/**
 * Execute a Python script and decode its JSON stdout.
 *
 * @param string $script Absolute script path.
 * @param array<int, string|int|float> $args Positional CLI arguments.
 * @return mixed
 */
function run_python_json(string $script, array $args)
{
    if (!is_file($script)) {
        throw new InvalidArgumentException("Python script not found: {$script}");
    }

    if (function_exists('set_time_limit')) {
        @set_time_limit(0);
    }
    @ini_set('max_execution_time', '0');

    $pythonExecutable = getenv('PYTHON_EXECUTABLE');
    if ($pythonExecutable === false || $pythonExecutable === '') {
        $pythonExecutable = dirname(__DIR__) . DIRECTORY_SEPARATOR . '.venv' . DIRECTORY_SEPARATOR . 'Scripts' . DIRECTORY_SEPARATOR . 'python.exe';
    }

    if (!is_file($pythonExecutable)) {
        $pythonExecutable = 'python';
    }

    $escapedArgs = array_map(
        static fn($arg): string => escapeshellarg((string) $arg),
        $args
    );

    $command = escapeshellarg($pythonExecutable) . ' ' . escapeshellarg($script);
    if (!empty($escapedArgs)) {
        $command .= ' ' . implode(' ', $escapedArgs);
    }

    $descriptors = [
        0 => ['pipe', 'r'],
        1 => ['pipe', 'w'],
        2 => ['pipe', 'w'],
    ];

    $process = proc_open($command, $descriptors, $pipes);
    if (!is_resource($process)) {
        throw new RuntimeException('Failed to start Python process.');
    }

    fclose($pipes[0]);
    $stdout = stream_get_contents($pipes[1]);
    $stderr = stream_get_contents($pipes[2]);
    fclose($pipes[1]);
    fclose($pipes[2]);

    $exitCode = proc_close($process);
    if ($exitCode !== 0) {
        $detail = trim((string) $stderr);
        throw new RuntimeException("Python process failed ({$exitCode}): {$detail}");
    }

    $decoded = json_decode((string) $stdout, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new RuntimeException('Invalid JSON output from Python script: ' . json_last_error_msg());
    }

    return $decoded;
}

/**
 * Bridge function for invoking ML models.
 *
 * Supported signatures:
 * - use_ml('arimax', horizon, nLags)
 * - use_ml('rfr', forecastHours)
 * - use_ml('rfc', date, temperature, humidity, windSpeed, ageRange, exertionLevel)
 *
 * @return mixed
 */
function use_ml(string $ml_type, ...$args)
{
    $baseDir = __DIR__;

    switch (strtolower($ml_type)) {
        case 'arimax': {
                if (count($args) !== 2) {
                    throw new InvalidArgumentException('arimax requires: horizon, n_lags');
                }

                [$horizon, $nLags] = $args;

                return run_python_json(
                    $baseDir . DIRECTORY_SEPARATOR . 'arimax.py',
                    [(int) $horizon, (int) $nLags]
                );
            }

        case 'rfr': {
                if (count($args) !== 1) {
                    throw new InvalidArgumentException('rfr requires: forecast_hours');
                }

                [$forecastHours] = $args;

                return run_python_json(
                    $baseDir . DIRECTORY_SEPARATOR . 'random-forest-regressor.py',
                    [(int) $forecastHours]
                );
            }

        case 'rfc': {
                if (count($args) !== 6) {
                    throw new InvalidArgumentException('rfc requires: date, temperature, humidity, wind_speed, age_range, exertion_level');
                }

                [$date, $temperature, $humidity, $windSpeed, $ageRange, $exertionLevel] = $args;

                return run_python_json(
                    $baseDir . DIRECTORY_SEPARATOR . 'random-forest-classifier.py',
                    [
                        (string) $date,
                        (float) $temperature,
                        (float) $humidity,
                        (float) $windSpeed,
                        (string) $ageRange,
                        (float) $exertionLevel,
                    ]
                );
            }

        default:
            throw new InvalidArgumentException("Unsupported ml_type: {$ml_type}");
    }
}
