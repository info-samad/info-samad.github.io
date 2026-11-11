import { useState, type FormEvent } from "react";
import {
  createWhatsAppLink,
  diagnoseSoil,
  irrigationSystems,
  measurementMethods,
  soilTypes,
  type EcUnit,
  type IrrigationSystem,
  type MeasurementMethod,
  type SoilDiagnosisInput,
  type SoilDiagnosisResult,
  type SoilType,
} from "@/data/agronomy";
import { Activity, ArrowLeft, ShieldCheck } from "lucide-react";

interface DiagnosisForm {
  crop: string;
  soilType: SoilType | "";
  irrigationSystem: IrrigationSystem | "";
  ec: string;
  ecUnit: EcUnit;
  ecMethod: MeasurementMethod | "";
  pH: string;
  pHMethod: MeasurementMethod | "";
  symptom: string;
}

const initialForm: DiagnosisForm = {
  crop: "",
  soilType: "",
  irrigationSystem: "",
  ec: "",
  ecUnit: "dS/m",
  ecMethod: "",
  pH: "",
  pHMethod: "",
  symptom: "",
};

function buildReport(input: SoilDiagnosisInput, result: SoilDiagnosisResult) {
  const unitLabel = input.ecUnit === "dS/m" ? "ديسيسيمنز/متر" : "ميكروسيمنز/سم";
  const soilLabel = soilTypes.find((soil) => soil.value === input.soilType)?.label;
  const irrigationLabel = irrigationSystems.find((system) => system.value === input.irrigationSystem)?.label;
  const ecMethodLabel = measurementMethods.find((method) => method.value === input.ecMethod)?.label;
  const pHMethodLabel = measurementMethods.find((method) => method.value === input.pHMethod)?.label;
  const date = new Intl.DateTimeFormat("ar-SY", { dateStyle: "medium" }).format(new Date());
  const lines = [
    "تقرير فحص تربة ومحصول — الزراعة النظيفة",
    `التاريخ: ${date}`,
    `المحصول: ${input.crop.trim()}`,
    `نوع التربة: ${soilLabel}`,
    `نظام الري: ${irrigationLabel}`,
    `EC: ${input.ec} ${unitLabel} — الطريقة: ${ecMethodLabel}`,
    `pH: ${input.pH} — الطريقة: ${pHMethodLabel}`,
    `الأعراض: ${input.symptom.trim()}`,
    result.status === "ready"
      ? `قراءة القاعدة المعتمدة: ${result.interpretation}\nالتوصية: ${result.recommendation}\nالمصدر: ${result.source}`
      : `الحالة: مراجعة هندسية مطلوبة. ${result.reason}`,
    "القياسات منقولة كما أدخلها المستخدم وتحتاج إلى التحقق من العينة وطريقة القياس.",
  ];
  return lines.join("\n");
}

export default function SoilDiagnosis() {
  const [form, setForm] = useState<DiagnosisForm>(initialForm);
  const [result, setResult] = useState<SoilDiagnosisResult | null>(null);
  const [whatsAppUrl, setWhatsAppUrl] = useState("");
  const [error, setError] = useState("");

  function update<K extends keyof DiagnosisForm>(key: K, value: DiagnosisForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setResult(null);
    setWhatsAppUrl("");
    setError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.soilType || !form.irrigationSystem || !form.ecMethod || !form.pHMethod) {
      setError("أكمل بيانات المحصول والتربة والري وطريقة قياس EC وpH.");
      return;
    }

    const input: SoilDiagnosisInput = {
      crop: form.crop,
      soilType: form.soilType,
      irrigationSystem: form.irrigationSystem,
      ec: Number(form.ec),
      ecUnit: form.ecUnit,
      ecMethod: form.ecMethod,
      pH: Number(form.pH),
      pHMethod: form.pHMethod,
      symptom: form.symptom,
    };
    const diagnosis = diagnoseSoil(input);
    setResult(diagnosis);
    setWhatsAppUrl(createWhatsAppLink(buildReport(input, diagnosis)));
    setError("");
  }

  return (
    <article className="farm-tool-card" aria-labelledby="soil-diagnosis-title">
      <div className="farm-tool-heading">
        <span className="farm-tool-icon" aria-hidden="true"><Activity size={21} /></span>
        <div>
          <p className="farm-tool-kicker">قراءة ضمن سياق المحصول والاختبار</p>
          <h3 id="soil-diagnosis-title">تشخيص التربة والمحصول</h3>
        </div>
      </div>
      <p className="farm-tool-intro">سجّل EC وpH وطريقة القياس والأعراض. تختلف حدود التفسير باختلاف المحصول وطريقة الاختبار.</p>

      <form className="farm-tool-form" onSubmit={handleSubmit}>
        <div className="tool-field">
          <label htmlFor="diagnosis-crop">المحصول</label>
          <input id="diagnosis-crop" required value={form.crop} onChange={(event) => update("crop", event.target.value)} placeholder="اكتب اسم المحصول" />
        </div>
        <div className="tool-field">
          <label htmlFor="diagnosis-soil">نوع التربة</label>
          <select id="diagnosis-soil" required value={form.soilType} onChange={(event) => update("soilType", event.target.value as SoilType | "")}>
            <option value="">اختر نوع التربة</option>
            {soilTypes.map((soil) => <option value={soil.value} key={soil.value}>{soil.label}</option>)}
          </select>
        </div>
        <div className="tool-field">
          <label htmlFor="diagnosis-irrigation">نظام الري</label>
          <select id="diagnosis-irrigation" required value={form.irrigationSystem} onChange={(event) => update("irrigationSystem", event.target.value as IrrigationSystem | "")}>
            <option value="">اختر نظام الري</option>
            {irrigationSystems.map((system) => <option value={system.value} key={system.value}>{system.label}</option>)}
          </select>
        </div>

        <fieldset className="tool-reading-group">
          <legend>الملوحة الكهربائية EC</legend>
          <div className="tool-inline-field">
            <input id="diagnosis-ec" type="number" inputMode="decimal" min="0" step="any" required value={form.ec} onChange={(event) => update("ec", event.target.value)} aria-label="قيمة الملوحة الكهربائية EC" placeholder="القيمة" />
            <label className="visually-hidden" htmlFor="diagnosis-ec-unit">وحدة EC</label>
            <select id="diagnosis-ec-unit" value={form.ecUnit} onChange={(event) => update("ecUnit", event.target.value as EcUnit)}>
              <option value="dS/m">dS/m</option>
              <option value="µS/cm">µS/cm</option>
            </select>
          </div>
          <div className="tool-field">
            <label htmlFor="diagnosis-ec-method">طريقة القياس / الاستخلاص</label>
            <select id="diagnosis-ec-method" required value={form.ecMethod} onChange={(event) => update("ecMethod", event.target.value as MeasurementMethod | "")}>
              <option value="">حدد طريقة الاختبار</option>
              {measurementMethods.map((method) => <option value={method.value} key={method.value}>{method.label}</option>)}
            </select>
          </div>
        </fieldset>

        <fieldset className="tool-reading-group">
          <legend>درجة الحموضة pH</legend>
          <div className="tool-field">
            <label htmlFor="diagnosis-ph">القراءة (من ٠ إلى ١٤)</label>
            <input id="diagnosis-ph" type="number" inputMode="decimal" min="0" max="14" step="any" required value={form.pH} onChange={(event) => update("pH", event.target.value)} placeholder="القيمة" />
          </div>
          <div className="tool-field">
            <label htmlFor="diagnosis-ph-method">طريقة القياس</label>
            <select id="diagnosis-ph-method" required value={form.pHMethod} onChange={(event) => update("pHMethod", event.target.value as MeasurementMethod | "")}>
              <option value="">حدد طريقة الاختبار</option>
              {measurementMethods.map((method) => <option value={method.value} key={method.value}>{method.label}</option>)}
            </select>
          </div>
        </fieldset>

        <div className="tool-field tool-field--wide">
          <label htmlFor="diagnosis-symptom">الأعراض الظاهرة</label>
          <textarea id="diagnosis-symptom" required rows={3} value={form.symptom} onChange={(event) => update("symptom", event.target.value)} placeholder="صف ما تلاحظه في الأوراق أو الجذور أو نمو المحصول" />
        </div>
        {error && <p className="tool-error" role="alert">{error}</p>}
        <button className="button button--green farm-tool-submit" type="submit">راجع البيانات وجهّز التقرير <ArrowLeft size={16} aria-hidden="true" /></button>
      </form>

      <p className="farm-tool-disclaimer"><ShieldCheck size={15} aria-hidden="true" /> لا توجد حاليًا قواعد تفسير معتمدة للمحاصيل وطرق الاختبار في الموقع؛ لا نصدر علاجًا أو جرعة افتراضية.</p>

      {result && (
        <div className={`tool-result tool-result--${result.status}`} role="status" aria-live="polite" aria-atomic="true">
          <h4>{result.status === "ready" ? "النتيجة المعتمدة" : "التوصية الآلية غير متاحة لهذه الحالة"}</h4>
          {result.status === "ready" ? <><p>{result.interpretation}</p><p><strong>التوصية:</strong> {result.recommendation}</p><p className="tool-source">المصدر: {result.source}</p></> : <p>{result.reason}</p>}
          <p className="whatsapp-note">راجع التقرير ثم اختر فتح واتساب؛ لن تُرسل أي بيانات قبل تأكيدك داخل التطبيق.</p>
          {whatsAppUrl && <a className="whatsapp-action" href={whatsAppUrl} target="_blank" rel="noopener noreferrer">تحويل التقرير إلى مهندس المعمل عبر واتساب <ArrowLeft size={15} aria-hidden="true" /></a>}
        </div>
      )}
    </article>
  );
}
