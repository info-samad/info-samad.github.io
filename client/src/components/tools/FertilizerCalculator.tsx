import { useState, type FormEvent } from "react";
import {
  approvedFertilizerRates,
  calculateFertilizerAmounts,
  createWhatsAppLink,
  irrigationSystems,
  soilTypes,
  type FertilizerCalculation,
  type FertilizerCalculationInput,
  type IrrigationSystem,
  type SoilType,
} from "@/data/agronomy";
import { ArrowLeft, Calculator, ShieldCheck } from "lucide-react";

const formatter = new Intl.NumberFormat("ar-SY", { maximumFractionDigits: 6 });

function formatQuantity(value: number) {
  return formatter.format(Number(value.toFixed(6)));
}

function getStatusCopy(result: FertilizerCalculation) {
  switch (result.status) {
    case "no-match":
      return "لا يوجد معدل موثّق يطابق هذا المحصول والتربة ونظام الري. لم نصدر كمية؛ أرسل بيانات الحقل إلى مهندس المعمل.";
    case "stage-required":
      return "تتغير الجرعة المعتمدة بحسب مرحلة النمو. أدخل المرحلة كما وردت في جدول المعمل ثم أعد الحساب.";
    case "unverified":
      return "سجل المعدل لا يتضمن اعتمادًا أو مصدرًا مكتملًا. لم نصدر كمية قبل التحقق من بيانات المنتج.";
    case "ambiguous":
      return "توجد أكثر من جرعة للمنتج نفسه في هذا السياق. أوقفنا الناتج الآلي لتحسمه مراجعة مهندس.";
    case "invalid":
      return "أدخل مساحة صحيحة أكبر من صفر واسم المحصول قبل الحساب.";
    case "ready":
      return "حُسبت الكميات من معدلات معتمدة مطابقة للمدخلات.";
  }
}

function buildRequestMessage(input: FertilizerCalculationInput, result: FertilizerCalculation) {
  const unitLabel = input.areaUnit === "hectare" ? "هكتار" : "دونم متري (١٬٠٠٠ م²)";
  const lines = [
    "طلب حاسبة تسميد — الزراعة النظيفة",
    `المساحة: ${input.area} ${unitLabel}`,
    `المحصول: ${input.crop.trim()}`,
    `التربة: ${soilTypes.find((soil) => soil.value === input.soilType)?.label}`,
    `الري: ${irrigationSystems.find((system) => system.value === input.irrigationSystem)?.label}`,
    input.growthStage.trim() && `مرحلة النمو: ${input.growthStage.trim()}`,
  ].filter(Boolean);

  if (result.status === "ready") {
    lines.push("الكميات الحسابية للمعدلات المعتمدة:");
    for (const item of result.amounts) {
      lines.push(item.unit === "kg"
        ? `${item.productName}: ${formatQuantity(item.quantity)} كغ (${formatQuantity(item.tonnes ?? 0)} طن)`
        : `${item.productName}: ${formatQuantity(item.quantity)} لتر`);
    }
  } else {
    lines.push(`الحالة: ${getStatusCopy(result)}`);
  }

  return lines.join("\n");
}

export default function FertilizerCalculator() {
  const [area, setArea] = useState("");
  const [areaUnit, setAreaUnit] = useState<"dunum" | "hectare">("dunum");
  const [soilType, setSoilType] = useState<SoilType | "">("");
  const [crop, setCrop] = useState("");
  const [irrigationSystem, setIrrigationSystem] = useState<IrrigationSystem | "">("");
  const [growthStage, setGrowthStage] = useState("");
  const [result, setResult] = useState<FertilizerCalculation | null>(null);
  const [whatsAppUrl, setWhatsAppUrl] = useState("");
  const [error, setError] = useState("");

  function clearResult() {
    setResult(null);
    setWhatsAppUrl("");
    setError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const numericArea = Number(area);
    if (!Number.isFinite(numericArea) || numericArea <= 0 || !soilType || !irrigationSystem || !crop.trim()) {
      setError("تحقق من المساحة والمحصول ونوع التربة ونظام الري.");
      return;
    }

    const input: FertilizerCalculationInput = {
      area: numericArea,
      areaUnit,
      soilType,
      crop,
      irrigationSystem,
      growthStage,
    };
    const calculation = calculateFertilizerAmounts(input);
    setResult(calculation);
    setWhatsAppUrl(createWhatsAppLink(buildRequestMessage(input, calculation)));
    setError("");
  }

  return (
    <article className="farm-tool-card" aria-labelledby="fertilizer-calculator-title">
      <div className="farm-tool-heading">
        <span className="farm-tool-icon" aria-hidden="true"><Calculator size={21} /></span>
        <div>
          <p className="farm-tool-kicker">حساب حسب المعدل المعتمد</p>
          <h3 id="fertilizer-calculator-title">حاسبة التسميد</h3>
        </div>
      </div>
      <p className="farm-tool-intro">أدخل بيانات الحقل. تُحسب كمية كل منتج فقط عند توفر معدل معتمد مطابق.</p>

      <form className="farm-tool-form" onSubmit={handleSubmit}>
        <div className="tool-field">
          <label htmlFor="fertilizer-area">المساحة</label>
          <div className="tool-inline-field">
            <input
              id="fertilizer-area"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              required
              value={area}
              onChange={(event) => { setArea(event.target.value); clearResult(); }}
              aria-describedby="fertilizer-area-note"
              placeholder="مثال: ١٫٥"
            />
            <label className="visually-hidden" htmlFor="fertilizer-area-unit">وحدة المساحة</label>
            <select
              id="fertilizer-area-unit"
              value={areaUnit}
              onChange={(event) => { setAreaUnit(event.target.value as "dunum" | "hectare"); clearResult(); }}
            >
              <option value="dunum">دونم متري</option>
              <option value="hectare">هكتار</option>
            </select>
          </div>
          <small id="fertilizer-area-note">الدونم المتري = ١٬٠٠٠ م²؛ ١ هكتار = ١٠ دونمات مترية.</small>
        </div>

        <div className="tool-field">
          <label htmlFor="fertilizer-soil">نوع التربة</label>
          <select id="fertilizer-soil" required value={soilType} onChange={(event) => { setSoilType(event.target.value as SoilType | ""); clearResult(); }}>
            <option value="">اختر نوع التربة</option>
            {soilTypes.map((soil) => <option value={soil.value} key={soil.value}>{soil.label}</option>)}
          </select>
        </div>

        <div className="tool-field">
          <label htmlFor="fertilizer-crop">المحصول</label>
          <input id="fertilizer-crop" list="approved-crop-list" required value={crop} onChange={(event) => { setCrop(event.target.value); clearResult(); }} placeholder="اكتب اسم المحصول" />
          <datalist id="approved-crop-list">
            {[...new Set(approvedFertilizerRates.map((rate) => rate.crop))].map((name) => <option value={name} key={name} />)}
          </datalist>
        </div>

        <div className="tool-field">
          <label htmlFor="fertilizer-irrigation">نظام الري</label>
          <select id="fertilizer-irrigation" required value={irrigationSystem} onChange={(event) => { setIrrigationSystem(event.target.value as IrrigationSystem | ""); clearResult(); }}>
            <option value="">اختر نظام الري</option>
            {irrigationSystems.map((system) => <option value={system.value} key={system.value}>{system.label}</option>)}
          </select>
        </div>

        <div className="tool-field tool-field--wide">
          <label htmlFor="fertilizer-stage">مرحلة النمو <span>إن كانت مرتبطة بجدول الجرعات</span></label>
          <input id="fertilizer-stage" value={growthStage} onChange={(event) => { setGrowthStage(event.target.value); clearResult(); }} placeholder="مثال: حسب المرحلة المحددة في توصية المعمل" />
        </div>

        {error && <p className="tool-error" role="alert">{error}</p>}
        <button className="button button--green farm-tool-submit" type="submit">احسب الكمية <ArrowLeft size={16} aria-hidden="true" /></button>
      </form>

      <p className="farm-tool-disclaimer"><ShieldCheck size={15} aria-hidden="true" /> {approvedFertilizerRates.length === 0
        ? "لا توجد معدلات منتجات موثّقة في الموقع حاليًا؛ لذلك لن نخمن جرعة أو كمية. النتائج لا تظهر إلا بعد اعتماد جدول المعمل."
        : "تُحسب الكميات من جدول معدلات اعتمده المعمل؛ وإن لم تتوفر حالتك فيه لن نخمّن جرعة."}</p>

      {result && (
        <div className={`tool-result tool-result--${result.status}`} role="status" aria-live="polite" aria-atomic="true">
          <h4>{result.status === "ready" ? "نتيجة الحساب" : "يلزم استكمال بيانات معتمدة"}</h4>
          <p>{getStatusCopy(result)}</p>
          {result.status === "ready" && (
            <>
              <p>المساحة المحوّلة: {formatQuantity(result.areaHectares)} هكتار.</p>
              <div className="tool-table-wrap">
                <table className="tool-result-table">
                  <caption>كمية الأسمدة للمساحة المدخلة</caption>
                  <thead><tr><th scope="col">المنتج</th><th scope="col">الكمية</th></tr></thead>
                  <tbody>
                    {result.amounts.map((item) => (
                      <tr key={item.productName}>
                        <th scope="row">{item.productName}</th>
                        <td>{item.unit === "kg"
                          ? <>{formatQuantity(item.quantity)} كغ <span>({formatQuantity(item.tonnes ?? 0)} طن)</span></>
                          : <>{formatQuantity(item.quantity)} لتر</>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {whatsAppUrl && <a className="whatsapp-action" href={whatsAppUrl} target="_blank" rel="noopener noreferrer">أرسل بيانات الحقل إلى المهندس عبر واتساب <ArrowLeft size={15} aria-hidden="true" /></a>}
        </div>
      )}
    </article>
  );
}
