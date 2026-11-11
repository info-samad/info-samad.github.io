import { describe, expect, it } from "vitest";
import {
  areaInHectares,
  calculateFertilizerAmounts,
  diagnoseSoil,
  type ApprovedDiagnosticRule,
  type ApprovedFertilizerRate,
  type FertilizerCalculationInput,
  type SoilDiagnosisInput,
} from "../client/src/data/agronomy";

// These records are fictional fixtures for unit tests only; they are never imported by the website.
const testRate: ApprovedFertilizerRate = {
  productName: "سماد اختبار فقط",
  crop: "طماطم",
  soilType: "sandy",
  irrigationSystem: "drip",
  ratePerHectare: 250,
  rateUnit: "kg/ha",
  source: "مصدر اصطناعي للاختبار",
  approvedBy: "مراجع اصطناعي للاختبار",
  reviewedAt: "2026-01-01",
};

const calculatorInput: FertilizerCalculationInput = {
  area: 5,
  areaUnit: "dunum",
  crop: "طماطم",
  soilType: "sandy",
  irrigationSystem: "drip",
  growthStage: "",
};

const diagnosisInput: SoilDiagnosisInput = {
  crop: "طماطم",
  soilType: "sandy",
  irrigationSystem: "drip",
  ec: 1500,
  ecUnit: "µS/cm",
  ecMethod: "ratio-1-2",
  pH: 7,
  pHMethod: "ratio-1-2",
  symptom: "اصفرار الأوراق",
};

const testRule: ApprovedDiagnosticRule = {
  crop: "طماطم",
  soilType: "sandy",
  irrigationSystem: "drip",
  ecMethod: "ratio-1-2",
  pHMethod: "ratio-1-2",
  symptom: "اصفرار الأوراق",
  ecMinDsM: 1,
  ecMaxDsMExclusive: 2,
  pHMinInclusive: 6,
  pHMaxExclusive: 8,
  interpretation: "تفسير اصطناعي للاختبار",
  recommendation: "توصية اصطناعية للاختبار",
  source: "قاعدة اصطناعية للاختبار",
  approvedBy: "مراجع اصطناعي للاختبار",
  reviewedAt: "2026-01-01",
};

describe("safe agriculture calculations", () => {
  it("converts the metric dunum to a tenth of a hectare", () => {
    expect(areaInHectares(10, "dunum")).toBe(1);
    expect(areaInHectares(1.5, "hectare")).toBe(1.5);
  });

  it("multiplies an approved per-hectare rate and reports kilograms and tonnes", () => {
    const result = calculateFertilizerAmounts(calculatorInput, [testRate]);
    expect(result.status).toBe("ready");
    if (result.status !== "ready") throw new Error("Expected one test rate to match.");
    expect(result.areaHectares).toBe(0.5);
    expect(result.amounts[0]).toMatchObject({ quantity: 125, unit: "kg", tonnes: 0.125 });
  });

  it("does not fabricate a rate when no product record matches", () => {
    expect(calculateFertilizerAmounts(calculatorInput, [])).toMatchObject({ status: "no-match" });
  });

  it("requires the stage when available product rates are stage-specific", () => {
    const result = calculateFertilizerAmounts(
      calculatorInput,
      [{ ...testRate, growthStage: "مرحلة نمو اختبارية" }],
    );
    expect(result.status).toBe("stage-required");
  });

  it("refuses duplicate rates for the same product and field conditions", () => {
    const result = calculateFertilizerAmounts(calculatorInput, [testRate, { ...testRate }]);
    expect(result.status).toBe("ambiguous");
  });

  it("routes diagnosis to an engineer when no reviewed rule matches", () => {
    expect(diagnoseSoil(diagnosisInput, [])).toMatchObject({ status: "review" });
  });

  it("matches the EC unit, test method, crop, soil, irrigation, pH and symptom before returning a test rule", () => {
    const result = diagnoseSoil(diagnosisInput, [testRule]);
    expect(result).toMatchObject({ status: "ready", interpretation: "تفسير اصطناعي للاختبار", source: "قاعدة اصطناعية للاختبار" });
  });

  it("treats a diagnostic upper limit as exclusive", () => {
    const result = diagnoseSoil({ ...diagnosisInput, ec: 2000 }, [testRule]);
    expect(result.status).toBe("review");
  });
});
