<?php

namespace App\Utils;

class HeatIndex
{
    public static function fromCelsius(float $temperatureC, float $humidity): float
    {
        $temperatureF = self::toFahrenheit($temperatureC);

        $heatIndexF = -42.379
            + 2.04901523 * $temperatureF
            + 10.14333127 * $humidity
            - 0.22475541 * $temperatureF * $humidity
            - 0.00683783 * $temperatureF * $temperatureF
            - 0.05481717 * $humidity * $humidity
            + 0.00122874 * $temperatureF * $temperatureF * $humidity
            + 0.00085282 * $temperatureF * $humidity * $humidity
            - 0.00000199 * $temperatureF * $temperatureF * $humidity * $humidity;

        if ($humidity < 13 && $temperatureF >= 80 && $temperatureF <= 112) {
            $heatIndexF -= ((13 - $humidity) / 4) * sqrt((17 - abs($temperatureF - 95)) / 17);
        }

        if ($humidity > 85 && $temperatureF >= 80 && $temperatureF <= 87) {
            $heatIndexF += (($humidity - 85) / 10) * ((87 - $temperatureF) / 5);
        }

        return round(self::toCelsius($heatIndexF), 2);
    }

    private static function toFahrenheit(float $temperatureC): float
    {
        return ($temperatureC * 9 / 5) + 32;
    }

    private static function toCelsius(float $temperatureF): float
    {
        return ($temperatureF - 32) * 5 / 9;
    }
}
