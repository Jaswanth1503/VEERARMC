export type WeatherStatus = "GOOD_WINDOW" | "CAUTION" | "DELAY_RECOMMENDED" | "UNSUITABLE";

export interface WeatherAnalysisResult {
  weatherStatus: WeatherStatus;
  temperatureCelsius: number;
  humidityPercent: number;
  rainProbabilityPercent: number;
  windSpeedKmh: number;
  conditionStatus: "CLEAR" | "CLOUDY" | "RAIN_WARNING" | "THUNDERSTORM";
  recommendationNote: string;
  riskNote?: string;
}

export class WeatherService {
  /**
   * Deterministic weather evaluation rules for concrete pouring safety.
   */
  static evaluatePourWeather(input?: {
    temperatureCelsius?: number;
    rainProbabilityPercent?: number;
    windSpeedKmh?: number;
  }): WeatherAnalysisResult {
    const temp = input?.temperatureCelsius ?? 28;
    const rainProb = input?.rainProbabilityPercent ?? 10;
    const wind = input?.windSpeedKmh ?? 12;

    let status: WeatherStatus = "GOOD_WINDOW";
    let condition: "CLEAR" | "CLOUDY" | "RAIN_WARNING" | "THUNDERSTORM" = "CLEAR";
    let note = "Ideal environmental conditions for concrete placement and curing.";
    let risk: string | undefined = undefined;

    if (rainProb > 70) {
      status = "UNSUITABLE";
      condition = "THUNDERSTORM";
      note = "Heavy rain/thunderstorm forecast (>70% probability). Pouring should be postponed.";
      risk = "Unset concrete surface wash-out risk due to heavy rainfall.";
    } else if (rainProb > 40) {
      status = "DELAY_RECOMMENDED";
      condition = "RAIN_WARNING";
      note = "Moderate rain probability (40-70%). Consider rescheduling pour to a clear window or prepare tarpaulin covers.";
      risk = "Rainwater contamination may increase water-cement ratio.";
    } else if (temp > 38) {
      status = "CAUTION";
      condition = "CLEAR";
      note = "High ambient temperature (>38°C). Chilled mixing water or retarder admixture recommended.";
      risk = "Rapid slump loss and plastic shrinkage cracking.";
    } else if (rainProb > 20 || wind > 25) {
      status = "CAUTION";
      condition = "CLOUDY";
      note = "Mild weather caution. Maintain standard curing protocols.";
    }

    return {
      weatherStatus: status,
      temperatureCelsius: temp,
      humidityPercent: 60,
      rainProbabilityPercent: rainProb,
      windSpeedKmh: wind,
      conditionStatus: condition,
      recommendationNote: note,
      riskNote: risk
    };
  }
}
