import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowUpLeft,
  BookOpen,
  Check,
  ChevronDown,
  FlaskConical,
  Leaf,
  Mail,
  MessageCircle,
  Package,
  Menu,
  Phone,
  Send,
  ShieldCheck,
  Sprout,
  Wheat,
  X,
} from "lucide-react";
import { solutions, product, faqs } from "@/data/marketing";
import { PHONE_NUMBERS, createWhatsAppLink } from "@/data/agronomy";
import BrandMark from "@/components/site/BrandMark";
import AgricultureTools from "@/components/tools/AgricultureTools";
import ScrollJourneyHero from "@/components/ScrollJourneyHero";

const navItems = [
  { label: "عن المعمل", href: "#about" },
  { label: "المنتج", href: "#product" },
  { label: "حلولنا", href: "#solutions" },
  { label: "أدوات المزرعة", href: "#tools" },
  { label: "الاستشارات", href: "#consulting" },
  { label: "المحتوى", href: "#knowledge" },
  { label: "أسئلة شائعة", href: "#faq" },
];

function SectionEyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow"><span aria-hidden="true" />{children}</p>;
}

function SectionHeading({
  eyebrow,
  title,
  description,
  align = "right",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "right" | "center";
}) {
  return (
    <div className={`section-heading section-heading--${align}`}>
      <SectionEyebrow>{eyebrow}</SectionEyebrow>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

function ArrowLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className="arrow-link" href={href}>
      {children}<ArrowLeft size={17} aria-hidden="true" />
    </a>
  );
}

function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header site-header--journey">
      <div className="header-inner">
        <a className="brand" href="#top" aria-label="الزراعة النظيفة — الرئيسية" onClick={() => setOpen(false)}>
          <BrandMark className="brand-mark" />
          <span className="brand-copy">
            <strong>الزراعة النظيفة</strong>
            <small>معمل الأسمدة العضوية والمخصبات</small>
          </span>
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
        </button>
        <nav className={open ? "main-nav main-nav--open" : "main-nav"} aria-label="التنقل الرئيسي">
          {navItems.map((item) => (
            <a href={item.href} key={item.href} onClick={() => setOpen(false)}>{item.label}</a>
          ))}
          <a className="nav-cta" href="#contact" onClick={() => setOpen(false)}>
            حضّر استفسارك <ArrowUpLeft size={15} aria-hidden="true" />
          </a>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return <ScrollJourneyHero />;
}

function About() {
  return (
    <section className="section about-section" id="about">
      <div className="about-image-wrap">
        <img src={`${import.meta.env.BASE_URL}manus-storage/about-olive-pistachio-crops_2b764ec7.webp`} alt="محاصيل خضراء داخل بيت بلاستيكي وبستانا زيتون وفستق حلبي في الخلفية" loading="lazy" />
        <div className="image-caption"><span className="caption-icon"><FlaskConical size={19} /></span><span><strong>أسمدة عضوية</strong><small>واستشارات تسميد الأراضي</small></span></div>
      </div>
      <div className="about-copy">
        <SectionEyebrow>منهجنا في الزراعة النظيفة</SectionEyebrow>
        <h2>نؤمن أن العناية بالأرض تبدأ بفهم <em>طبيعتها.</em></h2>
        <p>«الزراعة النظيفة» معمل لتصنيع الأسمدة العضوية وتقديم استشارات تسميد الأراضي وفق بيانات المنتج واحتياج التربة والمحصول.</p>
        <div className="manufacturing-note">
          <strong>بيانات المنتج أولًا</strong>
          <p>اطلب بطاقة المنتج وتعليمات الاستخدام المعتمدة قبل التسميد.</p>
        </div>
        <div className="about-values">
          <div><span className="value-icon"><ShieldCheck size={19} /></span><span><strong>وضوح قبل التوصية</strong><small>نشرح ما يناسب أرضك ولماذا.</small></span></div>
        </div>
        <ArrowLink href="#consulting">اكتشف منهج الاستشارة</ArrowLink>
      </div>
    </section>
  );
}


const waGeneral = createWhatsAppLink("مرحبًا، أريد الاستفسار عن السماد العضوي المعقّم (عبوة 25 كغ).");

function Product() {
  return (
    <section className="section product-section" id="product">
      <div className="section-topline">
        <SectionHeading eyebrow="منتجنا" title="سماد عضوي معقّم" description="المنتج الحالي للمعمل، جاهز للطلب." />
      </div>
      <article className="product-card">
        <span className="solution-icon"><Package size={26} aria-hidden="true" /></span>
        <div className="product-body">
          <h3>{product.name} <small>({product.source})</small></h3>
          <p className="product-pack">{product.pack}</p>
          <ul>{product.points.map((point) => <li key={point}><Check size={15} aria-hidden="true" /> {point}</li>)}</ul>
          <a className="button button--green" href={waGeneral} target="_blank" rel="noopener noreferrer">اطلب عبر واتساب <ArrowLeft size={17} aria-hidden="true" /></a>
        </div>
      </article>
    </section>
  );
}

function Faq() {
  return (
    <section className="section faq-section" id="faq">
      <div className="section-topline">
        <SectionHeading eyebrow="أسئلة شائعة" title="أجوبة سريعة للمزارع" />
      </div>
      <div className="faq-list">
        {faqs.map((item) => (
          <details className="faq-item" key={item.q}>
            <summary>{item.q} <ChevronDown size={15} aria-hidden="true" /></summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function WhatsAppFloat() {
  return (
    <a className="wa-float" href={waGeneral} target="_blank" rel="noopener noreferrer" aria-label="تواصل عبر واتساب">
      <MessageCircle size={26} aria-hidden="true" />
      <span>واتساب</span>
    </a>
  );
}

function Solutions() {
  return (
    <section className="section solutions-section" id="solutions">
      <div className="section-topline">
        <SectionHeading eyebrow="حلول المعمل" title="أسمدة عضوية واستشارات تسميد" description="تُحدّد ملاءمة المنتج من بياناته وتحليل التربة والمحصول." />
      </div>
      <div className="solutions-grid">
        {solutions.map((solution, index) => (
          <article className={`solution-card solution-card--${index + 1}`} key={solution.title}>
            <span className="card-number">0{index + 1}</span>
            <span className="solution-icon">{index === 0 ? <Leaf size={22} /> : index === 1 ? <Wheat size={22} /> : <FlaskConical size={22} />}</span>
            <h3>{solution.title}</h3>
            <p>{solution.description}</p>
            {solution.note && <span className="solution-note">{solution.note}</span>}
            <a className="card-arrow" href="#contact" aria-label={`استفسر عن ${solution.title}`}><ArrowLeft size={17} /></a>
          </article>
        ))}
      </div>
      <p className="technical-note"><ShieldCheck size={15} aria-hidden="true" /> اتبع ملصق المنتج ونتيجة تحليل التربة عند تحديد الجرعة.</p>
    </section>
  );
}

function Consulting() {
  const steps = [
    { n: "١", title: "نستمع إلى احتياجك", text: "المحصول، نوع الأرض، والمشكلة التي تريد معالجتها." },
    { n: "٢", title: "نراجع المعطيات", text: "نتائج التحليل إن توفرت، وظروف الريّ والموسم." },
    { n: "٣", title: "نضع برنامجًا عمليًا", text: "توصيات تسميد واضحة ترتبط بحالة الحقل." },
    { n: "٤", title: "نتابع ونتعلّم", text: "مراجعة الملاحظات والنتائج لتطوير الخطوة التالية." },
  ];
  return (
    <section className="consulting-section" id="consulting">
      <div className="consulting-inner">
        <div className="consulting-intro">
          <SectionEyebrow>استشارات تسميد الأراضي</SectionEyebrow>
          <h2>برنامج تسميد<br /><em>حسب بيانات الحقل.</em></h2>
          <p>نراجع المحصول والتربة والري، ثم نرتب خطوات التسميد والمتابعة.</p>
          <a className="button button--green" href="#contact">جهّز ملخص استشارتك <ArrowLeft size={17} aria-hidden="true" /></a>
        </div>
        <div className="steps-list">
          {steps.map((step) => (
            <div className="step" key={step.n}>
              <span className="step-number">{step.n}</span>
              <div><h3>{step.title}</h3><p>{step.text}</p></div>
              <Check size={16} className="step-check" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Knowledge() {
  const articles = [
    { category: "صحة التربة", time: "٤ دقائق", title: "كيف تقرأ قوام التربة قبل اختيار السماد؟", text: "ملاحظات أولية تساعدك على وصف أرضك، وما الذي يخبرك به التحليل الزراعي.", tips: ["لاحظ التكتل والقوام في أكثر من موضع؛ فقد تتباين أجزاء الحقل.", "استخدم ملاحظاتك لوصف العينة، لا لاستنتاج نقص عنصر أو تشخيص مشكلة من المظهر وحده.", "اعتمد تحليلًا مناسبًا قبل قرارات التسميد أو تعديل خصائص التربة."] },
    { category: "التسميد العضوي", time: "٥ دقائق", title: "السماد العضوي: دوره ضمن برنامج تغذية متوازن", text: "فهم دور المادة العضوية وكيف تتكامل مع إدارة الريّ والتسميد.", tips: ["تحقق من مصدر المادة وبيانات المنتج وملصق الاستخدام قبل التطبيق.", "أدخل المنتج في برنامج متوازن وفق تحليل التربة واحتياج المحصول.", "لا تفترض أن السماد العضوي يحل محل أي مدخل آخر؛ يحدد المختص التوازن وفق الحالة."] },
    { category: "إدارة الحقل", time: "٣ دقائق", title: "دفتر الحقل… أداة بسيطة لقرارات أفضل", text: "ما المعلومات التي يجدر تدوينها لتتعلم من كل موسم زراعي.", tips: ["دوّن التاريخ والريّ واسم المنتج ومعدل الاستخدام كما ورد على ملصقه.", "سجّل ملاحظات نمو المحصول دون نسبتها تلقائيًا إلى عامل واحد.", "قارن مناطق متشابهة الظروف وراجع الملاحظات مع مختص بعد كل مرحلة."] },
  ];
  return (
    <section className="section knowledge-section" id="knowledge">
      <div className="section-topline">
        <SectionHeading eyebrow="إرشادات زراعية" title="معلومات عملية للحقل" description="راجع تحليل التربة وملصق المنتج قبل قرارات التسميد." />
      </div>
      <div className="articles-grid">
        {articles.map((article, index) => (
          <article className="article-card" key={article.title}>
            <div className={`article-visual article-visual--${index + 1}`}>
              <span className="article-category">{article.category}</span>
              {index === 0 ? <Sprout size={51} strokeWidth={1.2} /> : index === 1 ? <Leaf size={51} strokeWidth={1.2} /> : <BookOpen size={51} strokeWidth={1.2} />}
              <span className="article-counter">0{index + 1}</span>
            </div>
            <div className="article-body">
              <div className="article-meta"><span><BookOpen size={13} /> دليل عملي</span><span>{article.time} للقراءة</span></div>
              <h3>{article.title}</h3>
              <p>{article.text}</p>
              <details className="article-details">
                <summary>اقرأ الإرشادات <ChevronDown size={14} aria-hidden="true" /></summary>
                <ul>{article.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul>
                <p className="article-caution">هذه إرشادات عامة؛ تُحدّد التوصية والجرعة وفق تحليل التربة وبيانات المنتج والمحصول.</p>
              </details>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ConsultationForm() {
  const [name, setName] = useState("");
  const [crop, setCrop] = useState("");
  const [need, setNeed] = useState("");
  const [area, setArea] = useState("");
  const [request, setRequest] = useState("");
  const [copied, setCopied] = useState(false);
  const requestText = useMemo(() => [
    "طلب استشارة زراعية — الزراعة النظيفة",
    name.trim() && `الاسم: ${name.trim()}`,
    crop.trim() && `المحصول/نوع الزراعة: ${crop.trim()}`,
    area.trim() && `المساحة أو الموقع (اختياري): ${area.trim()}`,
    need.trim() && `الاحتياج أو التحدي: ${need.trim()}`,
    "هل تتوفر نتيجة تحليل للتربة؟ سأرفقها عند التواصل إن توفرت.",
  ].filter(Boolean).join("\n"), [area, crop, name, need]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRequest(requestText);
    setCopied(false);
  }

  async function shareRequest() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "طلب استشارة زراعية", text: request });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(request);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="contact-form-card">
      <div className="form-heading"><span className="form-icon"><Send size={18} /></span><div><h3>ابدأ من سؤالٍ واحد</h3><p>املأ الحقول ثم أرسل الاستفسار إلى المعمل عبر واتساب.</p></div></div>
      <form onSubmit={handleSubmit}>
        <label>الاسم <span>اختياري</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="كيف نناديك؟" autoComplete="name" /></label>
        <label>المحصول أو نوع الزراعة<input value={crop} onChange={(e) => setCrop(e.target.value)} placeholder="مثال: خضروات، أشجار مثمرة…" /></label>
        <label>ما الذي تحتاج المساعدة فيه؟<textarea required value={need} onChange={(e) => setNeed(e.target.value)} placeholder="صف احتياج الأرض أو التحدي الذي تواجهه" rows={3} /></label>
        <label>المساحة أو الموقع <span>اختياري</span><input value={area} onChange={(e) => setArea(e.target.value)} placeholder="اكتب ما ترغب بمشاركته" /></label>
        <button className="button button--green form-submit" type="submit">جهّز نص الاستفسار <ArrowLeft size={17} aria-hidden="true" /></button>
      </form>
      {request && <div className="request-preview" aria-live="polite"><p><Check size={16} /> صار ملخص استفسارك جاهزًا للمشاركة:</p><pre>{request}</pre><a className="button button--green wa-send" href={createWhatsAppLink(request)} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> أرسل عبر واتساب</a><button type="button" onClick={shareRequest}>{copied ? <><Check size={16} /> نُسخ النص</> : <><Send size={16} /> مشاركة أو نسخ النص</>}</button></div>}
      <p className="privacy-note"><ShieldCheck size={14} aria-hidden="true" /> لا يُخزَّن شيء على موقعنا. يتكوّن النص على جهازك ولا يُرسل إلا عندما تضغط «أرسل عبر واتساب».</p>
    </div>
  );
}

function Contact() {
  return (
    <section className="contact-section" id="contact">
      <div className="contact-inner">
        <div className="contact-copy">
          <SectionEyebrow>التواصل</SectionEyebrow>
          <h2>استشارة زراعية<br /><em>لحقلك.</em></h2>
          <p>اتصل أو أرسل وصف المحصول ونتيجة تحليل التربة، إن توفرت.</p>
          <div className="contact-channels" aria-label="معلومات التواصل">
            {PHONE_NUMBERS.map((n) => (
              <a href={`tel:${n}`} key={n}><Phone size={17} aria-hidden="true" /><span dir="ltr">{n}</span></a>
            ))}
            <a href="mailto:info.samad@mail.com"><Mail size={17} aria-hidden="true" /><span dir="ltr">info.samad@mail.com</span></a>
          </div>
        </div>
        <ConsultationForm />
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <a className="brand footer-brand" href="#top"><BrandMark className="brand-mark" /><span className="brand-copy"><strong>الزراعة النظيفة</strong><small>معمل الأسمدة العضوية والمخصبات</small></span></a>
        <p>أسمدة عضوية واستشارات تسميد الأراضي.</p>
        <div className="footer-nav"><a href="#product">المنتج</a><a href="#solutions">حلولنا</a><a href="#consulting">الاستشارات</a><a href="#knowledge">المعرفة</a>{PHONE_NUMBERS.map((n) => <a href={`tel:${n}`} dir="ltr" key={n}>{n}</a>)}<a href="mailto:info.samad@mail.com" dir="ltr">info.samad@mail.com</a></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} الزراعة النظيفة</span><a href="#top">العودة إلى الأعلى ↑</a></div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="site-shell" dir="rtl">
      <Header />
      <main>
        <Hero />
        <About />
        <Product />
        <Solutions />
        <AgricultureTools />
        <Consulting />
        <Knowledge />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFloat />
      <a className="back-top" href="#top" aria-label="العودة إلى الأعلى"><ArrowUpLeft size={18} /></a>
    </div>
  );
}
