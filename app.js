// js/app.js

// --- Firebase Database Helper ---
const firebaseConfig = {
  apiKey: "AIzaSyBx9HhOL7ZDmp9c1Trmuc0syg23rT85zWw",
  authDomain: "promoter-app-c2a18.firebaseapp.com",
  projectId: "promoter-app-c2a18",
  storageBucket: "promoter-app-c2a18.firebasestorage.app",
  messagingSenderId: "926632289614",
  appId: "1:926632289614:web:2d1cf4407eaef3bfe4aa1f"
};
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// --- State Variables ---
let currentUser = null;
let userData = null;
let currentRole = null;
let currentLang = localStorage.getItem('appLang') || 'ar'; // default arabic
let editingUserUid = null;

const ADMIN_EMAILS = ['tetoabdallah@gmail.com'];

// --- Translation Dictionary ---
const dict = {
    ar: {
        login_title: "👤 تسجيل الدخول (محلي بدون نت)",
        login_subtitle: "تطبيق إدارة البروموتر والمبيعات (LocalStorage)",
        email_ph: "البريد الإلكتروني",
        pass_ph: "كلمة المرور",
        login_btn: "دخول",
        signup_btn: "إنشاء حساب جديد",
        logout: "خروج 🚪",
        admin_dash: "📊 لوحة التحكم الشاملة",
        admin_sales: "💰 كل المبيعات",
        admin_users: "👥 إدارة البروموترز",
        admin_products: "📦 إدارة الشركات والمنتجات",
        admin_backup: "💾 النسخ الاحتياطي",
        prm_dash: "🏠 الرئيسية",
        prm_sales: "➕ إدخال مبيعات",
        prm_att: "⏱️ الحضور والانصراف",
        sale_code: "كود الصنف",
        sale_price: "السعر",
        sale_date: "التاريخ",
        sale_time: "الوقت",
        sale_desc: "الوصف / الملاحظات",
        save_sale: "حفظ المبيعات 💾",
        my_sales: "مبيعاتي الأخيرة",
        att_title: "تسجيل الحضور اليومي",
        att_sub: "الدوام مقسم إلى فترتين (نصف ساعة لكل فترة)",
        slot1: "تسجيل حضور (الفترة 1)",
        slot2: "تسجيل حضور (الفترة 2)",
        att_history: "سجل الحضور",
        company: "الشركة",
        branch: "الفرع",
        promoter: "البروموتر",
        export_excel: "تصدير إكسيل 📊",
        send_email: "إرسال تقرير بالإيميل 📧",
        backup_title: "النسخ الاحتياطي وقاعدة البيانات",
        sales_summary: "ملخص المبيعات (الشركات والفروع)",
        add_user: "إضافة بروموتر جديد",
        user_role: "الصلاحية",
        promoter_code: "كود البروموتر",
        delete: "حذف",
        upload_excel: "رفع ملف إكسيل للمنتجات",
        select_company: "اختر الشركة",
        top_products: "أكثر المنتجات مبيعاً"
    },
    en: {
        login_title: "👤 Login (Local Mode)",
        login_subtitle: "Promoter & Sales Management App",
        email_ph: "Email Address",
        pass_ph: "Password",
        login_btn: "Login",
        signup_btn: "Create Account",
        logout: "Logout 🚪",
        admin_dash: "📊 Dashboard",
        admin_sales: "💰 All Sales",
        admin_users: "👥 Promoters Management",
        admin_products: "📦 Companies & Products",
        admin_backup: "💾 Backup",
        prm_dash: "🏠 Home",
        prm_sales: "➕ Add Sales",
        prm_att: "⏱️ Attendance",
        sale_code: "Item Code",
        sale_price: "Price",
        sale_date: "Date",
        sale_time: "Time",
        sale_desc: "Description / Notes",
        save_sale: "Save Sale 💾",
        my_sales: "My Recent Sales",
        att_title: "Daily Attendance",
        att_sub: "Shift is divided into 2 slots (30 mins each)",
        slot1: "Mark Attendance (Slot 1)",
        slot2: "Mark Attendance (Slot 2)",
        att_history: "Attendance History",
        company: "Company",
        branch: "Branch",
        promoter: "Promoter",
        export_excel: "Export Excel 📊",
        send_email: "Email Report 📧",
        backup_title: "Database Backup",
        sales_summary: "Sales Summary (Companies & Branches)",
        add_user: "Add New Promoter",
        user_role: "Role",
        promoter_code: "Promoter Code",
        delete: "Delete",
        upload_excel: "Upload Products Excel",
        select_company: "Select Company",
        top_products: "Top Selling Products"
    }
};

function t(key) {
    return dict[currentLang][key] || key;
}

function toggleLang() {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('appLang', currentLang);
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    window.location.reload();
}

// --- Utility Functions ---
function $(id) { return document.getElementById(id); }
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    $(id).classList.remove('hidden');
}
function toast(msg, type='info') {
    let t_el = document.createElement('div');
    t_el.className = `glass-card`;
    t_el.style.cssText = `background: ${type==='error'?'var(--rd)':'var(--gn)'}; color: #fff; margin-bottom: 10px; padding: 10px; border-radius: 8px; font-weight: bold;`;
    t_el.innerText = msg;
    $('toast-container').appendChild(t_el);
    $('toast-container').style.cssText = `position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 10000; display: flex; flex-direction: column;`;
    setTimeout(() => t_el.remove(), 3000);
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    
    // Seed admin if not exists in Firestore
    let adminEmail = 'tetoabdallah@gmail.com';
    db.collection('auth_users').where('email', '==', adminEmail.toLowerCase()).get().then(snap => {
        if (snap.empty) {
            db.collection('auth_users').doc('admin_root').set({uid: 'admin_root', email: adminEmail, password: 'admin'});
            db.collection('users').doc('admin_root').set({
                uid: 'admin_root',
                email: adminEmail,
                role: 'admin',
                promoterCode: 'ADMIN',
                branch: 'Main Branch',
                company: 'Main Company'
            });
        }
    });

    // Apply initial translations
    $('loginTitle').innerText = t('login_title');
    $('loginSub').innerText = t('login_subtitle');
    $('authEmail').placeholder = t('email_ph');
    $('authPass').placeholder = t('pass_ph');
    $('btnLogin').innerText = t('login_btn');
    $('btnLang').innerText = currentLang === 'ar' ? 'English' : 'عربي';
    
    checkAuth();
});

async function checkAuth() {
    let storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        $('uiName').innerText = currentUser.email.split('@')[0];
        
        let docSnap = await db.collection('users').doc(currentUser.uid).get();
        if (docSnap.exists) {
            userData = docSnap.data();
            currentRole = userData.role;
        } else {
            currentRole = ADMIN_EMAILS.includes(currentUser.email.toLowerCase()) ? 'admin' : 'promoter';
            userData = {
                uid: currentUser.uid,
                email: currentUser.email,
                role: currentRole,
                promoterCode: currentRole === 'promoter' ? 'PRM-' + Math.floor(Math.random()*10000) : 'ADMIN',
                branch: 'Main Branch',
                company: 'Main Company'
            };
            await db.collection('users').doc(currentUser.uid).set(userData);
        }
        
        $('uiRole').innerText = currentRole === 'admin' ? (currentLang==='ar'?'مدير الإدارة 👑':'Admin 👑') : (currentLang==='ar'?'بروموتر 👤':'Promoter 👤');
        buildNav();
        showScreen('app-screen');
    } else {
        currentUser = null;
        userData = null;
        currentRole = null;
        showScreen('auth-screen');
    }
    $('loader').classList.add('hidden');
}

// --- Auth ---
let loginMode = 'promoter';

function switchLogin(mode) {
    loginMode = mode;
    if(mode === 'promoter') {
        $('tabPromoter').style.background = 'var(--am)';
        $('tabAdmin').style.background = 'rgba(255,255,255,0.1)';
        $('loginTitle').innerText = currentLang === 'ar' ? '👤 دخول البروموتر' : '👤 Promoter Login';
    } else {
        $('tabAdmin').style.background = 'var(--am)';
        $('tabPromoter').style.background = 'rgba(255,255,255,0.1)';
        $('loginTitle').innerText = currentLang === 'ar' ? '👑 دخول الإدارة' : '👑 Admin Login';
    }
}

async function login() {
    let e = $('authEmail').value.trim();
    let p = $('authPass').value.trim();
    if (!e || !p) return toast('يرجى إدخال البريد وكلمة المرور', 'error');
    
    $('loader').classList.remove('hidden');
    
    try {
        let snap = await db.collection('auth_users').where('email', '==', e.toLowerCase()).where('password', '==', p).get();
        if (!snap.empty) {
            let user = snap.docs[0].data();
            
            let profileSnap = await db.collection('users').doc(user.uid).get();
            let profile = profileSnap.exists ? profileSnap.data() : null;
            let isAdmin = (profile && profile.role === 'admin') || ADMIN_EMAILS.includes(e.toLowerCase());
            
            if (loginMode === 'admin' && !isAdmin) {
                $('loader').classList.add('hidden');
                let msg = currentLang === 'ar' ? 'غير مصرح لك بالدخول من واجهة الإدارة.' : 'Not authorized for Admin portal.';
                $('authError').innerText = msg;
                $('authError').style.display = 'block';
                return toast(msg, 'error');
            }
            if (loginMode === 'promoter' && isAdmin) {
                $('loader').classList.add('hidden');
                let msg = currentLang === 'ar' ? 'يرجى الدخول من واجهة الإدارة الخاصة بك.' : 'Please use the Admin login tab.';
                $('authError').innerText = msg;
                $('authError').style.display = 'block';
                return toast(msg, 'error');
            }

            localStorage.setItem('currentUser', JSON.stringify({uid: user.uid, email: user.email}));
            $('authError').innerText = '';
            $('authError').style.display = 'none';
            checkAuth();
        } else {
            $('loader').classList.add('hidden');
            let msg = currentLang === 'ar' ? 'البريد أو كلمة المرور غير صحيحة.' : 'Invalid email or password.';
            $('authError').innerText = msg;
            toast(msg, 'error');
        }
    } catch(err) {
        $('loader').classList.add('hidden');
        toast('خطأ في الاتصال بقاعدة البيانات', 'error');
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    checkAuth();
}

// --- Navigation ---
function buildNav() {
    let links = '';
    if (currentRole === 'admin') {
        links += `<li onclick="nav('admin_dash')">${t('admin_dash')}</li>`;
        links += `<li onclick="nav('admin_sales')">${t('admin_sales')}</li>`;
        links += `<li onclick="nav('admin_users')">${t('admin_users')}</li>`;
        links += `<li onclick="nav('admin_products')">${t('admin_products')}</li>`;
        links += `<li onclick="nav('admin_backup')">${t('admin_backup')}</li>`;
    } else {
        links += `<li onclick="nav('promoter_dash')">${t('prm_dash')}</li>`;
        links += `<li onclick="nav('promoter_sales')">${t('prm_sales')}</li>`;
        links += `<li onclick="nav('promoter_attendance')">${t('prm_att')}</li>`;
    }
    $('navLinks').innerHTML = links;
    
    setTimeout(() => {
        let lis = $('navLinks').querySelectorAll('li');
        if(lis.length > 0) lis[0].click();
    }, 100);
}

function nav(page) {
    let lis = $('navLinks').querySelectorAll('li');
    lis.forEach(li => li.classList.remove('active'));
    let e = window.event;
    if(e && e.target && e.target.tagName === 'LI') e.target.classList.add('active');
    
    let content = '';
    let title = '';
    
    if (page === 'promoter_sales') {
        title = t('prm_sales');
        content = `
            <div class="glass-card">
                <div class="grid-2">
                    <div class="fg">
                        <label>${t('sale_code')}</label>
                        <select id="sCode" class="input-box" onchange="autoFillProductDetails()">
                            <option value="">${currentLang==='ar'?'اختر الصنف':'Select Item'}</option>
                        </select>
                    </div>
                    <div class="fg">
                        <label>${t('sale_price')}</label>
                        <input type="number" id="sPrice" class="input-box" placeholder="0" readonly style="background: rgba(255,255,255,0.02);">
                    </div>
                    <div class="fg">
                        <label>${t('sale_date')}</label>
                        <input type="date" id="sDate" class="input-box" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="fg">
                        <label>${t('sale_time')}</label>
                        <input type="time" id="sTime" class="input-box" value="${new Date().toTimeString().split(' ')[0].substring(0,5)}">
                    </div>
                </div>
                <div class="fg">
                    <label>${t('sale_desc')}</label>
                    <input type="text" id="sDesc" class="input-box" placeholder="..." readonly style="background: rgba(255,255,255,0.02);">
                </div>
                <button class="btn btn-primary" onclick="submitSale()">${t('save_sale')}</button>
            </div>
            <h3 style="margin-top:20px;">${t('my_sales')}</h3>
            <div class="glass-card" style="margin-top:10px; overflow-x:auto;">
                <table id="mySalesTable">
                    <tr><th>${t('sale_code')}</th><th>${t('sale_desc')}</th><th>${t('sale_price')}</th><th>${t('sale_date')}</th></tr>
                </table>
            </div>
        `;
        setTimeout(initPromoterSales, 100);
    }
    else if (page === 'promoter_attendance') {
        title = t('prm_att');
        content = `
            <div class="glass-card" style="text-align:center;">
                <h3>${t('att_title')}</h3>
                <p style="color:var(--tx2); margin-bottom:15px;">${t('att_sub')}</p>
                <div class="grid-2" style="max-width:400px; margin:auto;">
                    <button id="btnAtt1" class="btn btn-primary" onclick="markAttendance(1)">${t('slot1')}</button>
                    <button id="btnAtt2" class="btn btn-primary" onclick="markAttendance(2)">${t('slot2')}</button>
                </div>
            </div>
            <div class="glass-card" style="margin-top:20px;">
                <h3>${t('att_history')}</h3>
                <table id="myAttTable">
                    <tr><th>${t('sale_date')}</th><th>Slot 1</th><th>Slot 2</th></tr>
                </table>
            </div>
        `;
        setTimeout(loadMyAttendance, 100);
    }
    else if (page === 'admin_sales') {
        title = t('admin_sales');
        content = `
            <div class="glass-card" style="margin-bottom:15px; display:flex; gap:10px;">
                <button class="btn btn-primary" onclick="exportExcel()">${t('export_excel')}</button>
                <button class="btn btn-primary" onclick="emailReport()">${t('send_email')}</button>
            </div>
            <div class="glass-card" style="overflow-x:auto;">
                <table id="allSalesTable">
                    <tr><th>${t('company')}</th><th>${t('branch')}</th><th>${t('promoter')}</th><th>${t('sale_code')}</th><th>${t('sale_price')}</th><th>${t('sale_date')}</th></tr>
                </table>
            </div>
        `;
        setTimeout(loadAllSales, 100);
    }
    else if (page === 'admin_dash') {
        title = t('sales_summary');
        content = `
            <div class="grid-2">
                <div class="glass-card">
                    <h3>المبيعات حسب الشركة</h3>
                    <ul id="companySalesList" style="margin-top:10px; padding:0; list-style:none;"></ul>
                </div>
                <div class="glass-card">
                    <h3>المبيعات حسب الفرع</h3>
                    <ul id="branchSalesList" style="margin-top:10px; padding:0; list-style:none;"></ul>
                </div>
            </div>
            <div class="glass-card" style="margin-top: 20px;">
                <h3>${t('top_products')}</h3>
                <div id="topProductsContainer" class="grid-3" style="margin-top:10px;"></div>
            </div>
        `;
        setTimeout(loadDashboard, 100);
    }
    else if (page === 'admin_users') {
        title = t('admin_users');
        content = `
            <div class="glass-card" style="margin-bottom: 20px;">
                <h3 id="formUserTitle">${t('add_user')}</h3>
                <div class="grid-3" style="margin-top:10px;">
                    <div class="fg">
                        <label>${t('email_ph')}</label>
                        <input type="email" id="nuEmail" class="input-box" placeholder="promoter@test.com">
                    </div>
                    <div class="fg">
                        <label>${t('pass_ph')}</label>
                        <input type="password" id="nuPass" class="input-box" placeholder="123456">
                    </div>
                    <div class="fg">
                        <label>${t('company')}</label>
                        <input type="text" id="nuCompany" class="input-box" placeholder="Company Name">
                    </div>
                    <div class="fg">
                        <label>${t('branch')}</label>
                        <input type="text" id="nuBranch" class="input-box" placeholder="Branch Name">
                    </div>
                    <div class="fg">
                        <label>${t('promoter_code')}</label>
                        <input type="text" id="nuCode" class="input-box" placeholder="PRM-001">
                    </div>
                    <div class="fg">
                        <label>&nbsp;</label>
                        <div style="display:flex; gap:5px;">
                            <button id="btnUserAction" class="btn btn-primary" onclick="adminAddUser()">إضافة ➕</button>
                            <button id="btnUserCancel" class="btn btn-danger hidden" onclick="cancelEditUser()">إلغاء ✖️</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="glass-card" style="overflow-x:auto;">
                <table id="usersTable">
                    <tr><th>Email</th><th>${t('company')}</th><th>${t('branch')}</th><th>${t('promoter_code')}</th><th>Action</th></tr>
                </table>
            </div>
        `;
        setTimeout(loadAdminUsers, 100);
    }
    else if (page === 'admin_products') {
        title = t('admin_products');
        content = `
            <div class="glass-card" style="margin-bottom: 20px;">
                <h3>${t('upload_excel')}</h3>
                <p style="color:var(--tx2); font-size:0.9rem; margin-bottom:10px;">Excel columns must be: Code, Description, Price (or similar data format).</p>
                <div class="grid-2">
                    <div class="fg">
                        <label>${t('company')}</label>
                        <input type="text" id="prodCompany" class="input-box" placeholder="Company Name">
                    </div>
                    <div class="fg">
                        <label>Excel File (.xlsx)</label>
                        <input type="file" id="prodFile" class="input-box" accept=".xlsx, .xls">
                    </div>
                </div>
                <button class="btn btn-primary" style="margin-top: 10px;" onclick="uploadProductsExcel()">رفع البيانات 📤</button>
            </div>
            <div class="glass-card" style="overflow-x:auto;">
                <h3>المنتجات المسجلة</h3>
                <table id="productsTable" style="margin-top:10px;">
                    <tr><th>${t('company')}</th><th>${t('sale_code')}</th><th>${t('sale_desc')}</th><th>${t('sale_price')}</th><th>Action</th></tr>
                </table>
            </div>
        `;
        setTimeout(loadAdminProducts, 100);
    }
    else if (page === 'admin_backup') {
        title = t('admin_backup');
        content = `
            <div class="glass-card" style="text-align:center;">
                <h3>${t('backup_title')}</h3>
                <p style="color:var(--tx2); margin: 15px 0;">يمكنك سحب نسخة احتياطية من كل مبيعات التطبيق لضمان حفظ البيانات على الكمبيوتر.</p>
                <button class="btn btn-primary" style="max-width:300px; margin:auto;" onclick="exportExcel()">${t('export_excel')}</button>
                <br><br><hr style="border-color:var(--glass-border);"><br>
                <h3 style="color:var(--rd);">إعادة ضبط المصنع (حذف الحسابات)</h3>
                <p style="color:var(--tx2); margin: 15px 0;">سيتم حذف كل الحسابات والمبيعات من هذا الجهاز للبدء من جديد.</p>
                <button class="btn btn-danger" style="max-width:300px; margin:auto; background:var(--rd);" onclick="resetApp()">حذف كل البيانات ⚠️</button>
            </div>
        `;
    }
    else {
        title = t('prm_dash');
        content = `<div class="glass-card"><p>Welcome / أهلاً بك</p></div>`;
    }
    
    $('pageTitle').innerText = title;
    $('pageContent').innerHTML = content;
}

// --- Promoter Features ---
let cachedProducts = [];

async function initPromoterSales() {
    $('loader').classList.remove('hidden');
    try {
        let snap = await db.collection('products').where('company', '==', userData.company).get();
        cachedProducts = snap.docs.map(d => ({id: d.id, ...d.data()}));
        
        let select = $('sCode');
        if(select) {
            select.innerHTML = `<option value="">${currentLang==='ar'?'اختر الصنف':'Select Item'}</option>`;
            cachedProducts.forEach(p => {
                select.innerHTML += `<option value="${p.itemCode}">${p.itemCode} - ${p.description}</option>`;
            });
        }
        loadMySales();
    } catch(err) {
        toast('خطأ في جلب المنتجات', 'error');
        $('loader').classList.add('hidden');
    }
}

function autoFillProductDetails() {
    let code = $('sCode').value;
    let prod = cachedProducts.find(p => p.itemCode === code);
    if(prod) {
        $('sPrice').value = prod.price;
        $('sDesc').value = prod.description;
    } else {
        $('sPrice').value = '';
        $('sDesc').value = '';
    }
}

async function submitSale() {
    let c = $('sCode').value;
    let p = $('sPrice').value;
    let d = $('sDate').value;
    let t_str = $('sTime').value;
    let desc = $('sDesc').value;
    
    if(!c || !p) return toast('يرجى اختيار الصنف', 'error');
    
    $('loader').classList.remove('hidden');
    try {
        let docRef = db.collection('sales').doc();
        await docRef.set({
            uid: currentUser.uid,
            promoterCode: userData.promoterCode,
            branch: userData.branch,
            company: userData.company,
            itemCode: c,
            price: Number(p),
            date: d,
            time: t_str,
            description: desc,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        toast('تم الحفظ بنجاح', 'success');
        $('sCode').value = ''; $('sPrice').value = ''; $('sDesc').value = '';
        loadMySales();
    } catch(err) {
        toast(err.message, 'error');
        $('loader').classList.add('hidden');
    }
}

async function loadMySales() {
    let tb = $('mySalesTable');
    if(!tb) return;
    tb.innerHTML = `<tr><th>${t('sale_code')}</th><th>${t('sale_desc')}</th><th>${t('sale_price')}</th><th>${t('sale_date')}</th></tr>`;
    
    try {
        let snap = await db.collection('sales').where('uid', '==', currentUser.uid).orderBy('timestamp', 'desc').limit(20).get();
        snap.docs.forEach(doc => {
            let d = doc.data();
            tb.innerHTML += `<tr><td>${d.itemCode}</td><td>${d.description}</td><td>${d.price}</td><td>${d.date} ${d.time}</td></tr>`;
        });
    } catch(err) {
        console.error(err);
    }
    $('loader').classList.add('hidden');
}

async function markAttendance(slot) {
    let d = new Date().toISOString().split('T')[0];
    let docId = currentUser.uid + "_" + d;
    
    $('loader').classList.remove('hidden');
    try {
        let docRef = db.collection('attendance').doc(docId);
        let docSnap = await docRef.get();
        let data = docSnap.exists ? docSnap.data() : { uid: currentUser.uid, date: d, slot1: false, slot2: false, timestamp: firebase.firestore.FieldValue.serverTimestamp() };
        
        if (slot === 1) data.slot1 = true;
        if (slot === 2) data.slot2 = true;
        
        await docRef.set(data, {merge: true});
        toast('تم تسجيل الحضور', 'success');
        loadMyAttendance();
    } catch(err) {
        toast(err.message, 'error');
        $('loader').classList.add('hidden');
    }
}

async function loadMyAttendance() {
    let tb = $('myAttTable');
    if(!tb) return;
    
    tb.innerHTML = `<tr><th>${t('sale_date')}</th><th>Slot 1</th><th>Slot 2</th></tr>`;
    let today = new Date().toISOString().split('T')[0];
    
    try {
        let snap = await db.collection('attendance').where('uid', '==', currentUser.uid).orderBy('date', 'desc').limit(10).get();
        snap.docs.forEach(doc => {
            let d = doc.data();
            let s1 = d.slot1 ? '✅' : '❌';
            let s2 = d.slot2 ? '✅' : '❌';
            tb.innerHTML += `<tr><td>${d.date}</td><td>${s1}</td><td>${s2}</td></tr>`;
            
            if(d.date === today) {
                if(d.slot1) { $('btnAtt1').disabled = true; $('btnAtt1').innerText = 'تم ✔️'; $('btnAtt1').style.background = 'var(--gn)'; }
                if(d.slot2) { $('btnAtt2').disabled = true; $('btnAtt2').innerText = 'تم ✔️'; $('btnAtt2').style.background = 'var(--gn)'; }
            }
        });
    } catch(err) {
        console.error(err);
    }
    $('loader').classList.add('hidden');
}

// --- Admin Features ---
async function loadAllSales() {
    let tb = $('allSalesTable');
    if(!tb) return;
    
    tb.innerHTML = `<tr><th>${t('company')}</th><th>${t('branch')}</th><th>${t('promoter')}</th><th>${t('sale_code')}</th><th>${t('sale_price')}</th><th>${t('sale_date')}</th></tr>`;
    try {
        let snap = await db.collection('sales').orderBy('timestamp', 'desc').limit(100).get();
        snap.docs.forEach(doc => {
            let d = doc.data();
            tb.innerHTML += `<tr><td>${d.company}</td><td>${d.branch}</td><td>${d.promoterCode}</td><td>${d.itemCode}</td><td>${d.price}</td><td>${d.date} ${d.time}</td></tr>`;
        });
    } catch(err) { console.error(err); }
}

async function loadDashboard() {
    let compObj = {};
    let brObj = {};
    let prodObj = {}; // For top products per company
    
    try {
        let snap = await db.collection('sales').get(); // might need to limit or query last 30 days
        snap.docs.forEach(doc => {
            let d = doc.data();
            compObj[d.company] = (compObj[d.company] || 0) + d.price;
            brObj[d.branch] = (brObj[d.branch] || 0) + d.price;
            
            if(!prodObj[d.company]) prodObj[d.company] = {};
            prodObj[d.company][d.itemCode] = (prodObj[d.company][d.itemCode] || 0) + d.price;
        });
        
        let cList = $('companySalesList');
        if(cList) {
            cList.innerHTML = '';
            for(let c in compObj) cList.innerHTML += `<li style="padding:10px; border-bottom:1px solid var(--glass-border); display:flex; justify-content:space-between;"><span>${c}</span> <strong>${compObj[c]}</strong></li>`;
        }
        
        let bList = $('branchSalesList');
        if(bList) {
            bList.innerHTML = '';
            for(let b in brObj) bList.innerHTML += `<li style="padding:10px; border-bottom:1px solid var(--glass-border); display:flex; justify-content:space-between;"><span>${b}</span> <strong>${brObj[b]}</strong></li>`;
        }
        
        let tpCont = $('topProductsContainer');
        if(tpCont) {
            tpCont.innerHTML = '';
            for(let c in prodObj) {
                let sortedProds = Object.entries(prodObj[c]).sort((a,b) => b[1] - a[1]).slice(0, 5);
                let prodsHtml = sortedProds.map(p => `<li style="display:flex; justify-content:space-between; font-size:0.8rem; margin-top:5px; padding-bottom:5px; border-bottom:1px solid rgba(255,255,255,0.05);"><span>${p[0]}</span> <strong>${p[1]}</strong></li>`).join('');
                tpCont.innerHTML += `
                    <div style="background:rgba(0,0,0,0.2); padding:10px; border-radius:8px; border:1px solid var(--glass-border);">
                        <h4 style="color:var(--am); margin-bottom:10px;">${c}</h4>
                        <ul style="list-style:none; padding:0;">${prodsHtml}</ul>
                    </div>
                `;
            }
        }
    } catch(err) { console.error(err); }
}

let cachedAdminUsers = [];
let cachedAdminAuthUsers = [];

async function adminAddUser() {
    let e = $('nuEmail').value.trim();
    let p = $('nuPass').value.trim();
    let comp = $('nuCompany').value.trim();
    let br = $('nuBranch').value.trim();
    let code = $('nuCode').value.trim();
    let r = $('nuRole').value;
    
    if(!e || !p) return toast('يرجى تعبئة البريد وكلمة المرور', 'error');
    if(r === 'promoter' && (!comp || !br || !code)) return toast('يرجى تعبئة بيانات الشركة للبروموتر', 'error');
    
    $('loader').classList.remove('hidden');
    try {
        let snap = await db.collection('auth_users').where('email', '==', e.toLowerCase()).get();
        if (!snap.empty) {
            $('loader').classList.add('hidden');
            return toast('هذا البريد مسجل بالفعل', 'error');
        }
        
        let uid = 'usr_' + Date.now();
        await db.collection('auth_users').doc(uid).set({uid: uid, email: e.toLowerCase(), password: p});
        await db.collection('users').doc(uid).set({
            uid: uid,
            email: e.toLowerCase(),
            role: r,
            promoterCode: code || 'ADMIN',
            branch: br || 'All Branches',
            company: comp || 'All Companies'
        });
        
        toast('تم إضافة الحساب بنجاح', 'success');
        $('nuEmail').value = ''; $('nuPass').value = ''; $('nuCompany').value = ''; $('nuBranch').value = ''; $('nuCode').value = ''; $('nuRole').value = 'promoter';
        loadAdminUsers();
    } catch(err) {
        toast('خطأ: ' + err.message, 'error');
    }
    $('loader').classList.add('hidden');
}

async function loadAdminUsers() {
    let tb = $('usersTable');
    if(!tb) return;
    
    $('loader').classList.remove('hidden');
    try {
        let authSnap = await db.collection('auth_users').get();
        cachedAdminAuthUsers = authSnap.docs.map(d => d.data());
        
        let usersSnap = await db.collection('users').get();
        cachedAdminUsers = usersSnap.docs.map(d => d.data());
        
        tb.innerHTML = `<tr><th>Role</th><th>Email</th><th>${t('company')}</th><th>${t('branch')}</th><th>${t('promoter_code')}</th><th>Action</th></tr>`;
        cachedAdminUsers.forEach(u => {
            let roleBadge = u.role === 'admin' ? '👑 مدير' : '👤 بروموتر';
            let actionBtns = '';
            if(u.email.toLowerCase() === ADMIN_EMAILS[0].toLowerCase()) {
                actionBtns = `<button class="btn btn-primary" style="padding:5px 10px; font-size:0.8rem;" onclick="editUser('${u.uid}')">تعديل ✏️</button>`;
            } else {
                actionBtns = `
                    <button class="btn btn-primary" style="padding:5px 10px; font-size:0.8rem; margin-left:5px;" onclick="editUser('${u.uid}')">تعديل ✏️</button>
                    <button class="btn btn-danger" style="padding:5px 10px; font-size:0.8rem;" onclick="deleteUser('${u.uid}')">${t('delete')}</button>
                `;
            }
            
            tb.innerHTML += `<tr>
                <td>${roleBadge}</td>
                <td>${u.email}</td>
                <td>${u.company || '-'}</td>
                <td>${u.branch || '-'}</td>
                <td>${u.promoterCode || '-'}</td>
                <td>${actionBtns}</td>
            </tr>`;
        });
    } catch(err) { console.error(err); }
    $('loader').classList.add('hidden');
}

function editUser(uid) {
    let u = cachedAdminUsers.find(x => x.uid === uid);
    let au = cachedAdminAuthUsers.find(x => x.uid === uid);
    
    if(!u || !au) return;
    
    editingUserUid = uid;
    
    $('nuEmail').value = u.email;
    $('nuPass').value = au.password;
    $('nuCompany').value = u.company;
    $('nuBranch').value = u.branch;
    $('nuCode').value = u.promoterCode;
    $('nuRole').value = u.role || 'promoter';
    
    $('formUserTitle').innerText = currentLang === 'ar' ? 'تعديل بيانات الحساب' : 'Edit Account';
    $('btnUserAction').innerText = currentLang === 'ar' ? 'حفظ التعديل 💾' : 'Save 💾';
    $('btnUserAction').onclick = adminUpdateUser;
    $('btnUserCancel').classList.remove('hidden');
    
    window.scrollTo({top: 0, behavior: 'smooth'});
}

function cancelEditUser() {
    editingUserUid = null;
    $('nuEmail').value = '';
    $('nuPass').value = '';
    $('nuCompany').value = '';
    $('nuBranch').value = '';
    $('nuCode').value = '';
    $('nuRole').value = 'promoter';
    
    $('formUserTitle').innerText = t('add_user');
    $('btnUserAction').innerText = currentLang === 'ar' ? 'إضافة ➕' : 'Add ➕';
    $('btnUserAction').onclick = adminAddUser;
    $('btnUserCancel').classList.add('hidden');
}

        authUsers[auIndex].password = p;
        LocalDB.set('auth_users', authUsers);
    }
    
    let users = LocalDB.get('users');
    let uIndex = users.findIndex(u => u.uid === editingUserUid);
    if(uIndex > -1) {
        users[uIndex].email = e;
        users[uIndex].company = comp;
        users[uIndex].branch = br;
        users[uIndex].promoterCode = code;
        LocalDB.set('users', users);
    }
    
    toast(currentLang === 'ar' ? 'تم التعديل بنجاح' : 'Updated successfully', 'success');
    cancelEditUser();
    loadAdminUsers();
}

function deleteUser(uid) {
    if(!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    
    let authUsers = LocalDB.get('auth_users').filter(u => u.uid !== uid);
    LocalDB.set('auth_users', authUsers);
    
    let users = LocalDB.get('users').filter(u => u.uid !== uid);
    LocalDB.set('users', users);
    
    toast('تم الحذف', 'success');
    loadAdminUsers();
}

async function uploadProductsExcel() {
    let comp = $('prodCompany').value.trim();
    let fileInput = $('prodFile');
    
    if(!comp) return toast('يرجى إدخال اسم الشركة', 'error');
    if(!fileInput.files.length) return toast('يرجى اختيار ملف إكسيل', 'error');
    
    if(typeof XLSX === 'undefined') return toast('المكتبة غير محملة بعد، يرجى المحاولة لاحقاً', 'error');
    
    $('loader').classList.remove('hidden');
    let file = fileInput.files[0];
    let reader = new FileReader();
    
    reader.onload = async function(e) {
        try {
            let data = new Uint8Array(e.target.result);
            let workbook = XLSX.read(data, {type: 'array'});
            let firstSheetName = workbook.SheetNames[0];
            let worksheet = workbook.Sheets[firstSheetName];
            
            // Convert to JSON array
            let json = XLSX.utils.sheet_to_json(worksheet, {header: 1});
            if(json.length < 2) throw new Error("الملف فارغ أو لا يحتوي على بيانات");
            
            let addedCount = 0;
            const batch = db.batch(); // Firestore batch write
            
            for(let i = 1; i < json.length; i++) {
                let row = json[i];
                if(row.length >= 3 && row[0]) {
                    let docRef = db.collection('products').doc();
                    batch.set(docRef, {
                        company: comp,
                        itemCode: String(row[0]).trim(),
                        description: String(row[1]).trim(),
                        price: Number(row[2]) || 0,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    addedCount++;
                    
                    if(addedCount % 500 === 0) {
                        await batch.commit(); // commit chunks if large
                    }
                }
            }
            await batch.commit();
            
            toast(`تم رفع ${addedCount} منتج بنجاح لشركة ${comp}`, 'success');
            $('prodCompany').value = '';
            fileInput.value = '';
            loadAdminProducts();
        } catch(err) {
            toast('حدث خطأ أثناء قراءة الملف: ' + err.message, 'error');
        }
        $('loader').classList.add('hidden');
    };
    reader.onerror = function() {
        toast('حدث خطأ في قراءة الملف', 'error');
        $('loader').classList.add('hidden');
    };
    reader.readAsArrayBuffer(file);
}

async function loadAdminProducts() {
    let tb = $('productsTable');
    if(!tb) return;
    
    $('loader').classList.remove('hidden');
    try {
        let snap = await db.collection('products').orderBy('timestamp', 'desc').limit(100).get();
        tb.innerHTML = `<tr><th>${t('company')}</th><th>${t('sale_code')}</th><th>${t('sale_desc')}</th><th>${t('sale_price')}</th><th>Action</th></tr>`;
        snap.docs.forEach(doc => {
            let p = {id: doc.id, ...doc.data()};
            tb.innerHTML += `<tr>
                <td>${p.company}</td>
                <td>${p.itemCode}</td>
                <td>${p.description}</td>
                <td>${p.price}</td>
                <td><button class="btn btn-danger" style="padding:5px 10px; font-size:0.8rem;" onclick="deleteProduct('${p.id}')">${t('delete')}</button></td>
            </tr>`;
        });
    } catch(err) { console.error(err); }
    $('loader').classList.add('hidden');
}

async function deleteProduct(id) {
    if(!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    
    $('loader').classList.remove('hidden');
    try {
        await db.collection('products').doc(id).delete();
        toast('تم الحذف', 'success');
        loadAdminProducts();
    } catch(err) {
        toast('خطأ: ' + err.message, 'error');
    }
    $('loader').classList.add('hidden');
}

async function exportExcel() {
    if(typeof XLSX === 'undefined') {
        toast('المكتبة غير محملة بعد، حاول مرة أخرى.', 'error');
        return;
    }
    
    $('loader').classList.remove('hidden');
    try {
        let snap = await db.collection('sales').orderBy('timestamp', 'desc').get();
        let data = [];
        snap.docs.forEach(doc => {
            let d = doc.data();
            data.push({
                "Company": d.company,
                "Branch": d.branch,
                "Promoter Code": d.promoterCode,
                "Item Code": d.itemCode,
                "Description": d.description,
                "Price": d.price,
                "Date": d.date,
                "Time": d.time
            });
        });
        
        let ws = XLSX.utils.json_to_sheet(data);
        let wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sales");
        XLSX.writeFile(wb, "Promoter_Sales_Backup_" + new Date().toISOString().split('T')[0] + ".xlsx");
    } catch(err) {
        toast('خطأ في التصدير: ' + err.message, 'error');
    }
    $('loader').classList.add('hidden');
}

async function emailReport() {
    $('loader').classList.remove('hidden');
    try {
        let snap = await db.collection('sales').orderBy('timestamp', 'desc').limit(50).get();
        let body = "Sales Report Summary:\n\n";
        let total = 0;
        
        snap.docs.forEach(doc => {
            let d = doc.data();
            body += `- [${d.company}] ${d.branch} | Promoter: ${d.promoterCode} | Item: ${d.itemCode} | Price: ${d.price} | Date: ${d.date}\n`;
            total += d.price;
        });
        body += `\nTotal Sales Value: ${total}\n`;
        
        let mailtoLink = `mailto:${ADMIN_EMAILS[0]}?subject=Promoter App Sales Report&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
    } catch(err) {
        toast('خطأ في الإرسال: ' + err.message, 'error');
    }
    $('loader').classList.add('hidden');
}

function resetApp() {
    if(confirm('هل أنت متأكد من رغبتك في حذف الحسابات والمبيعات بالكامل للبدء من جديد؟')) {
        localStorage.clear();
        window.location.reload();
    }
}
