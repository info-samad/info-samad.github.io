# نشر الموقع مجانًا كموقع ثابت

الموقع لا يحتاج خادمًا ولا قاعدة بيانات (الصفحة الرئيسية لا تستدعي أي واجهة برمجية)، لذلك يصلح على أي استضافة ثابتة مجانية.

## قبل البناء: صورتان ناقصتان
صورتا الغلاف و«عن المعمل» مخزنتان على منصة Manus وليستا في المشروع.
1. افتح الموقع الحالي، انقر بزر الفأرة الأيمن على كل صورة ← «حفظ الصورة باسم».
2. ضعهما في `client/public/manus-storage/` بهذين الاسمين بالضبط:
   - `hero-olive-pistachio-greenhouse_d909a9dd.webp`
   - `about-olive-pistachio-crops_2b764ec7.webp`

(لا حاجة لتعديل الكود: ما في مجلد `public` يُخدم من جذر الموقع.)

## البناء (على أي حاسوب فيه Node 20 أو أحدث)
```
npm i -g pnpm
pnpm install
pnpm vite build
```
الناتج في المجلد `dist/public`، وهو ما يُرفع.

## الرفع
- **Cloudflare Pages:** Workers & Pages ← Create ← Pages ← **Upload assets** ← اسحب مجلد `dist/public`. لا يحتاج GitHub.
- **GitHub Pages:** ارفع محتوى `dist/public` إلى مستودع، ثم Settings ← Pages.
- **Vercel / Netlify:** اسحب المجلد `dist/public` في صفحة الرفع اليدوي.

## بعد الحصول على الرابط الجديد
1. في `client/index.html` غيّر النطاق في وسمي `og:image` و`twitter:image` إلى رابط موقعك الجديد، ثم أعد البناء والرفع.
2. افتح الموقع من اتصال داخل سوريا للتأكد أن الزائر يستطيع الوصول إليه.
