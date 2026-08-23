/**
 * Central Quality Risk Thresholds Configuration for Veera RMC 2.0.
 * Easy to modify or extend without changing core application logic.
 */
export const QUALITY_RISK_THRESHOLDS = {
  // Margin = (Predicted Strength - Target Strength) in MPa
  MARGIN: {
    HIGH_RISK_MAX: 0.0,    // Margin < 0.0 MPa (Predicted strength below target)
    MEDIUM_RISK_MAX: 2.5,  // Margin < 2.5 MPa (Tight buffer)
    SAFE_MIN: 2.5          // Margin >= 2.5 MPa (Comfortable strength buffer)
  },

  // Water-Cement / Water-Binder Ratio Limits
  WATER_CEMENT_RATIO: {
    OPTIMAL_MIN: 0.35,
    OPTIMAL_MAX: 0.50,
    WARNING_MAX: 0.55,
    CRITICAL_MAX: 0.62
  },

  // Binder Content (kg/m³)
  TOTAL_BINDER: {
    MIN_RECOMMENDED: 300,
    MAX_RECOMMENDED: 550
  },

  // Chemical Admixture Dosage (% of Total Binder by weight)
  ADMIXTURE_PERCENT: {
    NORMAL_MAX: 1.5,
    WARNING_MAX: 2.5
  },

  // Aggregate Fine/Total Ratio (% of Total Aggregates)
  FINE_AGGREGATE_RATIO: {
    MIN_PERCENT: 35.0,
    MAX_PERCENT: 48.0
  },

  // Confidence Score Thresholds (%)
  CONFIDENCE: {
    HIGH_MIN: 85,
    MEDIUM_MIN: 70
  }
};
