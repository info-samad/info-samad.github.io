#!/usr/bin/env python3
"""يحوّل جدول الجرعات data/dose-rates.csv إلى ملف يقرؤه الموقع، بعد فحصه.

الاستخدام:   python3 scripts/build_rates.py            (من مجلد المشروع)
             python3 scripts/build_rates.py ملف.csv    (ملف آخر)

عند وجود أي خطأ يُطبع رقم الصف والسبب ولا يُكتب شيء، فلا تصل جرعة ناقصة أو مكررة إلى الموقع.
لا يحتاج أي مكتبة خارجية.
"""
import csv, json, sys
from datetime import date, datetime
from decimal import Decimal, InvalidOperation
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "data" / "dose-rates.csv"
OUT = ROOT / "client" / "src" / "data" / "approvedRates.generated.ts"

COLUMNS = {  # عنوان العمود في الجدول -> المفتاح
    "المنتج": "productName", "المحصول": "crop", "نوع التربة": "soil", "نظام الري": "irrigation",
    "مرحلة النمو": "growthStage", "المعدل": "rate", "الوحدة": "unit",
    "المصدر": "source", "المعتمد من": "approvedBy", "تاريخ المراجعة": "reviewedAt",
}
OPTIONAL = {"growthStage"}
SOIL = {"رملية": "sandy", "طينية": "clay", "كلسية": "calcareous"}
IRRIGATION = {"تنقيط": "drip", "رش": "sprinkler", "سطحي": "surface", "بعلي": "rainfed",
              "مطري": "rainfed", "بعلي / مطري": "rainfed", "أخرى": "other"}
# الوحدة -> (وحدة الموقع، معامل التحويل إلى الهكتار). الدونم المتري = 1000 م² = 0.1 هكتار
UNITS = {
    "kg/ha": ("kg/ha", 1), "l/ha": ("L/ha", 1), "kg/dunum": ("kg/ha", 10), "l/dunum": ("L/ha", 10),
    "كغ/هكتار": ("kg/ha", 1), "لتر/هكتار": ("L/ha", 1), "كغ/دونم": ("kg/ha", 10), "لتر/دونم": ("L/ha", 10),
}
DIGITS = str.maketrans("٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹٫", "01234567890123456789.")

def norm(v: str) -> str:
    return " ".join((v or "").replace("‏", "").replace("‎", "").split())

def norm_key(v: str) -> str:  # نفس فكرة المطابقة في الموقع: تجاهل التشكيل وتوحيد الألف والياء
    import re
    v = re.sub("[ً-ٰٟـ]", "", norm(v))
    return re.sub("[أإآ]", "ا", v).replace("ى", "ي").lower()

def read_rows(path: Path):
    text = path.read_text(encoding="utf-8-sig")
    try:
        dialect = csv.Sniffer().sniff(text.splitlines()[0], delimiters=",;\t")
    except (csv.Error, IndexError):
        dialect = csv.excel
    return csv.DictReader(text.splitlines(), dialect=dialect)

def main() -> int:
    if not SRC.exists():
        print(f"الملف غير موجود: {SRC}"); return 1
    reader = read_rows(SRC)
    headers = [norm(h) for h in (reader.fieldnames or [])]
    missing = [h for h, k in COLUMNS.items() if h not in headers]
    if missing:
        print("أعمدة ناقصة في الصف الأول: " + "، ".join(missing)); return 1

    errors, rates, seen = [], [], {}
    for i, raw in enumerate(reader, start=2):  # الصف 1 = العناوين
        row = {COLUMNS[norm(k)]: norm(v) for k, v in raw.items() if norm(k) in COLUMNS}
        if not any(row.values()):
            continue  # صف فارغ
        before = len(errors)
        def err(msg): errors.append(f"الصف {i}: {msg}")
        for h, k in COLUMNS.items():
            if k not in OPTIONAL and not row.get(k):
                err(f"الحقل «{h}» فارغ")
        soil = SOIL.get(row.get("soil", ""))
        if row.get("soil") and not soil: err(f"نوع التربة «{row['soil']}» غير معروف (المسموح: {'، '.join(SOIL)})")
        irr = IRRIGATION.get(row.get("irrigation", ""))
        if row.get("irrigation") and not irr: err(f"نظام الري «{row['irrigation']}» غير معروف (المسموح: تنقيط، رش، سطحي، بعلي، أخرى)")
        unit = UNITS.get(row.get("unit", "").lower().replace(" ", ""))
        if row.get("unit") and not unit: err(f"الوحدة «{row['unit']}» غير معروفة (المسموح: kg/ha, L/ha, kg/dunum, L/dunum أو كغ/دونم، لتر/دونم...)")
        value = None
        if row.get("rate"):
            s = row["rate"].translate(DIGITS).replace(",", ".") if "." not in row["rate"].translate(DIGITS) else row["rate"].translate(DIGITS)
            try:
                value = Decimal(s)
                if not value.is_finite() or value <= 0: raise InvalidOperation
            except InvalidOperation:
                err(f"المعدل «{row['rate']}» ليس رقمًا موجبًا"); value = None
        reviewed = None
        if row.get("reviewedAt"):
            try:
                reviewed = datetime.strptime(row["reviewedAt"].translate(DIGITS), "%Y-%m-%d").date()
                if reviewed > date.today(): err("تاريخ المراجعة في المستقبل"); reviewed = None
            except ValueError:
                err(f"تاريخ المراجعة «{row['reviewedAt']}» يجب أن يكون بصيغة 2026-11-07")
        if len(errors) > before:
            continue
        site_unit, factor = unit
        per_ha = value * factor
        key = (norm_key(row["productName"]), norm_key(row["crop"]), soil, irr)
        stage = norm_key(row.get("growthStage", ""))
        for (prev_stage, prev_row) in seen.get(key, []):
            if prev_stage == stage:
                err(f"مكرر مع الصف {prev_row} (نفس المنتج والمحصول والتربة والري والمرحلة)")
            elif not prev_stage or not stage:
                err(f"يتعارض مع الصف {prev_row}: أحدهما بلا مرحلة نمو والآخر بمرحلة، فتنطبق جرعتان على الحالة نفسها. حدّد مرحلة لكل الصفوف أو لا تحدد لأي صف")
        seen.setdefault(key, []).append((stage, i))
        entry = {
            "productName": row["productName"], "crop": row["crop"], "soilType": soil, "irrigationSystem": irr,
            "ratePerHectare": float(per_ha.normalize()), "rateUnit": site_unit,
            "source": row["source"], "approvedBy": row["approvedBy"], "reviewedAt": reviewed.isoformat(),
        }
        if row.get("growthStage"): entry["growthStage"] = row["growthStage"]
        rates.append(entry)

    if errors:
        print(f"لم يُحدَّث الموقع. {len(errors)} خطأ في {SRC.name}:")
        for e in errors: print("  - " + e)
        return 1

    body = json.dumps(rates, ensure_ascii=False, indent=2)
    OUT.write_text(
        "// ملف مولَّد تلقائيًا من data/dose-rates.csv بواسطة scripts/build_rates.py. لا تعدله يدويًا.\n"
        'import type { ApprovedFertilizerRate } from "./agronomy";\n\n'
        f"export const generatedFertilizerRates: ApprovedFertilizerRate[] = {body};\n", encoding="utf-8")
    print(f"تم: {len(rates)} معدلًا -> {OUT.relative_to(ROOT)}")
    for p in sorted({r['productName'] for r in rates}):
        crops = sorted({r['crop'] for r in rates if r['productName'] == p})
        print(f"  • {p}: {len(crops)} محصول ({'، '.join(crops)})")
    stale = [r for r in rates if (date.today() - date.fromisoformat(r['reviewedAt'])).days > 365]
    if stale: print(f"تنبيه: {len(stale)} معدلًا مراجَعًا منذ أكثر من سنة؛ يُستحسن إعادة اعتماده.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
