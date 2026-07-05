import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

// تعريف الـ __dirname يدوياً لأنها غير مدعومة افتراضياً في نظام ES Modules (type: module)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let splashWindow;

// فحص هل التطبيق يعمل في بيئة التطوير أم الإنتاج
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindows() {
  // 1. نافذة التحميل وشريط التقدم (Splash Screen)
  splashWindow = new BrowserWindow({
    width: 500,
    height: 350,
    frame: false,          // بدون إطار علوي
    transparent: true,     // خلفية شفافة لجمالية التصميم ونقاء المظهر
    alwaysOnTop: true,
    // في بيئة التطوير نستخدم أيقونة المجلد الرئيسي، وفي الإنتاج نعتمد على نظام التشغيل أو مجلد dist
    icon: isDev ? path.join(__dirname, 'build/icon.ico') : path.join(__dirname, 'dist/assets/logo-BZSGjzNA.png'),
    webPreferences: {
      nodeIntegration: false
    }
  });

  // تصميم واجهة التحميل برابط HTML مباشر مع ستايل نيون داكن متناسق مع هوية النظام
  splashWindow.loadURL(`data:text/html;charset=utf-8,
    <html>
    <head>
      <style>
        body {
          margin: 0; padding: 0;
          background: #0b0b1e; color: #fff;
          font-family: system-ui, sans-serif;
          display: flex; flex-direction: column;
          justify-content: center; align-items: center;
          height: 100vh; border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          overflow: hidden; /* إخفاء أشرطة التمرير تماماً */
        }
        .loader-container { width: 80%; text-align: center; }
        .title { font-size: 20px; font-weight: 600; margin-bottom: 20px; letter-spacing: 1px; color: #00f3ff; }
        .progress-bar {
          width: 100%; height: 6px;
          background: rgba(255,255,255,0.1);
          border-radius: 10px; overflow: hidden;
          position: relative;
        }
        .progress-fill {
          width: 0%; height: 100%;
          background: linear-gradient(90deg, #00f3ff, #ff00ff);
          border-radius: 10px;
          animation: load 2.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        @keyframes load {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
      </style>
    </head>
    <body>
      <div class="loader-container">
        <div class="title">جاري تهيئة النظام...</div>
        <div class="progress-bar"><div class="progress-fill"></div></div>
      </div>
    </body>
    </html>
  `);

  // 2. النافذة الرئيسية للتطبيق
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    show: false,       // لا تظهر حتى تجهز الواجهة تماماً لمنع الوميض الأبيض
    fullscreen: false,  // فتح التطبيق بشاشة كاملة مباشرة لتجربة غامرة ونظيفة للكمبيوتر
    icon: isDev ? path.join(__dirname, 'build/icon.ico') : path.join(__dirname, 'dist/assets/logo-BZSGjzNA.png'),
    webPreferences: {
      // إذا كان لديك ملف preload.js قم بتفعيل السطر التالي، وإلا اتركه معطلاً لتجنب الأخطاء
      // preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // إخفاء شريط القوائم العلوي الافتراضي (File, Edit..) للحفاظ على نظافة واجهة الشاشة الواحدة
  mainWindow.setMenuBarVisibility(false);

  // التبديل الذكي بين تشغيل السيرفر المحلي أو قراءة ملفات الـ Build الجاهزة
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173'); // رابط خادم تطوير Vite الافتراضي
    // mainWindow.webContents.openDevTools();   // يمكنك تفعيل هذا السطر إذا كنت تريد فتح الـ Inspect Element أثناء البرمجة
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  // عند تجهيز النافذة الرئيسية، أغلق شاشة التحميل وافتح التطبيق بسلاسة
  mainWindow.once('ready-to-show', () => {
    setTimeout(() => {
      if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.close();
      }
      mainWindow.show();
    }, 2500); // تأخير متناسق مع زمن حركة شريط التقدم (2.5 ثانية)
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindows);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindows();
});