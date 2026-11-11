import FertilizerCalculator from "@/components/tools/FertilizerCalculator";
import SoilDiagnosis from "@/components/tools/SoilDiagnosis";
import { Sprout } from "lucide-react";

export default function AgricultureTools() {
  return (
    <section className="tools-section" id="tools" aria-labelledby="tools-title">
      <div className="tools-section-inner">
        <div className="tools-section-heading">
          <p className="eyebrow"><span aria-hidden="true" /> أدوات المزرعة</p>
          <h2 id="tools-title">بيانات الحقل أولًا</h2>
          <p>احسب المعدل المعتمد أو جهّز تقرير التربة للمراجعة الهندسية.</p>
        </div>
        <div className="tools-grid">
          <FertilizerCalculator />
          <SoilDiagnosis />
        </div>
        <p className="tools-footer-note"><Sprout size={16} aria-hidden="true" /> لا تظهر جرعة أو تشخيص رقمي إلا من بيانات فنية راجعها المعمل.</p>
      </div>
    </section>
  );
}
