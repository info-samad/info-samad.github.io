import { generatedFertilizerRates } from "./approvedRates.generated";

export const soilTypes = [
  { value: "sandy", label: "رملية" },
  { value: "clay", label: "طينية" },
  { value: "calcareous", label: "كلسية" },
] as const;

export type SoilType = (typeof soilTypes)[number]["value"];

export const irrigationSystems = [
  { value: "drip", label: "تنقيط" },
  { value: "sprinkler", label: "رش" },
  { value: "surface", label: "سطحي" },
  { value: "rainfed", label: "بعلي / مطري" },
  { value: "other", label: "أخرى" },
] as const;

export type IrrigationSystem = (typeof irrigationSystems)[number]["value"];

export const measurementMethods = [
  { value: "saturated-paste", label: "مستخلص العجينة المشبعة (ECe)" },
  { value: "ratio-1-2", label: "مستخلص تربة إلى ماء 1:2" },
  { value: "ratio-1-5", label: "مستخلص تربة إلى ماء 1:5" },
  { value: "other", label: "طريقة أخرى / غير مذكورة" },
] as const;

export type MeasurementMethod = (typeof measurementMethods)[number]["value"];
export type EcUnit = "dS/m" | "µS/cm";

export interface ApprovedFertilizerRate {
  productName: string;
  crop: string;
  soilType: SoilType;
  irrigationSystem: IrrigationSystem;
  growthStage?: string;
  ratePerHectare: number;
  rateUnit: "kg/ha" | "L/ha";
  source: string;
  approvedBy: string;
  reviewedAt: string;
}

export interface FertilizerCalculationInput {
  area: number;
  areaUnit: "dunum" | "hectare";
  crop: string;
  soilType: SoilType;
  irrigationSystem: IrrigationSystem;
  growthStage: string;
}

export interface FertilizerAmount {
  productName: string;
  quantity: number;
  unit: "kg" | "L";
  tonnes?: number;
}

export type FertilizerCalculation =
  | { status: "ready"; areaHectares: number; amounts: FertilizerAmount[] }
  | { status: "invalid" }
  | { status: "no-match"; areaHectares: number }
  | { status: "stage-required"; areaHectares: number }
  | { status: "unverified"; areaHectares: number }
  | { status: "ambiguous"; areaHectares: number };

/** Generated from data/dose-rates.csv by scripts/build_rates.py; add only rates the laboratory has approved. */
export const approvedFertilizerRates: ApprovedFertilizerRate[] = generatedFertilizerRates;

function normalizeArabic(value: string) {
  return value
    .trim()
    .normalize("NFC")
    .replace(/[\u064B-\u065F\u0670ـ]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .toLocaleLowerCase("ar-SY");
}

function hasApproval(rate: ApprovedFertilizerRate) {
  return Number.isFinite(rate.ratePerHectare)
    && rate.ratePerHectare > 0
    && Boolean(rate.productName.trim())
    && Boolean(rate.source.trim())
    && Boolean(rate.approvedBy.trim())
    && Boolean(rate.reviewedAt.trim());
}

export function areaInHectares(area: number, unit: "dunum" | "hectare") {
  return unit === "hectare" ? area : area / 10;
}

export function calculateFertilizerAmounts(
  input: FertilizerCalculationInput,
  rates: ApprovedFertilizerRate[] = approvedFertilizerRates,
): FertilizerCalculation {
  if (!Number.isFinite(input.area) || input.area <= 0 || !normalizeArabic(input.crop)) {
    return { status: "invalid" };
  }

  const areaHectares = areaInHectares(input.area, input.areaUnit);
  const baseMatches = rates.filter((rate) =>
    normalizeArabic(rate.crop) === normalizeArabic(input.crop)
    && rate.soilType === input.soilType
    && rate.irrigationSystem === input.irrigationSystem,
  );

  if (baseMatches.length === 0) return { status: "no-match", areaHectares };
  if (!input.growthStage.trim() && baseMatches.some((rate) => Boolean(rate.growthStage))) {
    return { status: "stage-required", areaHectares };
  }

  const matches = baseMatches.filter((rate) =>
    !rate.growthStage || normalizeArabic(rate.growthStage) === normalizeArabic(input.growthStage),
  );

  if (matches.length === 0) return { status: "no-match", areaHectares };
  if (matches.some((rate) => !hasApproval(rate))) return { status: "unverified", areaHectares };

  const productCounts = new Map<string, number>();
  for (const rate of matches) {
    const productKey = normalizeArabic(rate.productName);
    productCounts.set(productKey, (productCounts.get(productKey) ?? 0) + 1);
  }
  if ([...productCounts.values()].some((count) => count !== 1)) {
    return { status: "ambiguous", areaHectares };
  }

  const amounts = matches.map((rate) => {
    const quantity = rate.ratePerHectare * areaHectares;
    return rate.rateUnit === "kg/ha"
      ? { productName: rate.productName, quantity, unit: "kg" as const, tonnes: quantity / 1000 }
      : { productName: rate.productName, quantity, unit: "L" as const };
  });

  return { status: "ready", areaHectares, amounts };
}

export interface ApprovedDiagnosticRule {
  crop: string;
  soilType: SoilType;
  irrigationSystem: IrrigationSystem;
  ecMethod: MeasurementMethod;
  pHMethod: MeasurementMethod;
  symptom: string;
  ecMinDsM: number;
  ecMaxDsMExclusive: number;
  pHMinInclusive: number;
  pHMaxExclusive: number;
  interpretation: string;
  recommendation: string;
  source: string;
  approvedBy: string;
  reviewedAt: string;
}

export interface SoilDiagnosisInput {
  crop: string;
  soilType: SoilType;
  irrigationSystem: IrrigationSystem;
  ec: number;
  ecUnit: EcUnit;
  ecMethod: MeasurementMethod;
  pH: number;
  pHMethod: MeasurementMethod;
  symptom: string;
}

export type SoilDiagnosisResult =
  | { status: "ready"; interpretation: string; recommendation: string; source: string }
  | { status: "review"; reason: string }
  | { status: "ambiguous"; reason: string };

/** Empty until the lab approves crop-, soil- and test-method-specific interpretation rules. */
export const approvedSoilDiagnosisRules: ApprovedDiagnosticRule[] = [];

function validDiagnosticRule(rule: ApprovedDiagnosticRule) {
  return Number.isFinite(rule.ecMinDsM)
    && Number.isFinite(rule.ecMaxDsMExclusive)
    && rule.ecMinDsM < rule.ecMaxDsMExclusive
    && Number.isFinite(rule.pHMinInclusive)
    && Number.isFinite(rule.pHMaxExclusive)
    && rule.pHMinInclusive < rule.pHMaxExclusive
    && Boolean(rule.interpretation.trim())
    && Boolean(rule.recommendation.trim())
    && Boolean(rule.source.trim())
    && Boolean(rule.approvedBy.trim())
    && Boolean(rule.reviewedAt.trim());
}

export function diagnoseSoil(
  input: SoilDiagnosisInput,
  rules: ApprovedDiagnosticRule[] = approvedSoilDiagnosisRules,
): SoilDiagnosisResult {
  if (!Number.isFinite(input.ec) || input.ec < 0 || !Number.isFinite(input.pH) || input.pH < 0 || input.pH > 14) {
    return { status: "review", reason: "راجع قيم التحليل ووحداتها قبل تفسيرها." };
  }

  const ecDsM = input.ecUnit === "µS/cm" ? input.ec / 1000 : input.ec;
  const crop = normalizeArabic(input.crop);
  const symptom = normalizeArabic(input.symptom);
  const matches = rules.filter((rule) =>
    validDiagnosticRule(rule)
    && normalizeArabic(rule.crop) === crop
    && rule.soilType === input.soilType
    && rule.irrigationSystem === input.irrigationSystem
    && rule.ecMethod === input.ecMethod
    && rule.pHMethod === input.pHMethod
    && normalizeArabic(rule.symptom) === symptom
    && ecDsM >= rule.ecMinDsM
    && ecDsM < rule.ecMaxDsMExclusive
    && input.pH >= rule.pHMinInclusive
    && input.pH < rule.pHMaxExclusive,
  );

  if (matches.length === 0) {
    return {
      status: "review",
      reason: "لا توجد قاعدة تشخيص موثّقة تطابق المحصول والتربة والري وطريقة القياس والأعراض المدخلة. أرسل التقرير إلى المهندس لمراجعته.",
    };
  }
  if (matches.length !== 1) {
    return {
      status: "ambiguous",
      reason: "تنطبق أكثر من قاعدة أو يوجد تداخل في الحدود؛ أوقفنا التوصية الآلية وأحلنا التقرير إلى المهندس.",
    };
  }

  const [rule] = matches;
  return {
    status: "ready",
    interpretation: rule.interpretation,
    recommendation: rule.recommendation,
    source: rule.source,
  };
}

export const WHATSAPP_NUMBER = "963944526924";

export const PHONE_NUMBERS = ["+963944526924", "+963992656199", "+963949311627"];

export function createWhatsAppLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
