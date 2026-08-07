const firebaseConfig = { apiKey: "AIzaSyBx9HhOL7ZDmp9c1Trmuc0syg23rT85zWw", authDomain: "promoter-app-c2a18.firebaseapp.com", projectId: "promoter-app-c2a18", storageBucket: "promoter-app-c2a18.firebasestorage.app", messagingSenderId: "926632289614", appId: "1:926632289614:web:2d1cf4407eaef3bfe4aa1f" };
if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const db = firebase.firestore();
db.settings({ experimentalForceLongPolling: true });
const storage = firebase.storage();
db.enablePersistence().catch(err => console.log('Offline mode err:', err));

window.onerror = function(msg, url, line) {
    if (typeof msg === 'string' && msg.includes('ResizeObserver')) return;
    toast(`Error: ${msg} (Line ${line})`, 'error');
    $('loader').classList.add('hidden');
};
window.onunhandledrejection = function(e) {
    toast(`Promise Error: ${e.reason ? e.reason.message : 'Unknown'}`, 'error');
    $('loader').classList.add('hidden');
};

let currentUser = null, userData = null, currentRole = null, currentLang = localStorage.getItem('appLang') || 'ar', editingUserUid = null, chart1 = null, chart2 = null;
const ADMIN_EMAILS = ['tetoabdallah@gmail.com'];
const dict = {
    ar: { login_title: "👤 تسجيل الدخول (السحابي)", login_subtitle: "تطبيق إدارة البروموتر والمبيعات", email_ph: "البريد الإلكتروني", pass_ph: "كلمة المرور", login_btn: "دخول", logout: "خروج 🚪", admin_dash: "📊 لوحة التحكم", admin_sales: "💰 كل المبيعات", admin_users: "👥 البروموترز", admin_products: "📦 المنتجات", admin_companies: "🏢 الشركات والمخزون", admin_companies_manager: "🏢 إدارة الشركات الشاملة", admin_promoters: "👥 البروموترز", admin_admins: "👑 المديرين", prm_dash: "🏠 الرئيسية", prm_sales: "➕ مبيعات", prm_att: "⏱️ الحضور", sale_code: "كود الصنف", sale_price: "السعر", sale_date: "التاريخ", sale_desc: "الوصف", company: "الشركة", branch: "الفرع", promoter: "البروموتر", delete: "حذف", add_new_account: "إضافة حساب جديد", email: "البريد", password: "كلمة المرور", role: "الصلاحية", role_promoter: "بروموتر", role_admin: "مدير", promoter_code: "كود البروموتر", target_monthly: "التارجت (شهري)", commission_rate: "نسبة العمولة (%)", add_btn: "إضافة ➕", cancel_btn: "إلغاء ✖️", edit_account_title: "تعديل بيانات الحساب", save_btn: "حفظ 💾", confirm_delete: "هل أنت متأكد من الحذف؟", upload_excel_title: "رفع المنتجات (Excel)", excel_file: "ملف إكسيل (.xlsx)", upload_btn: "رفع 📤", fill_fields: "يرجى تعبئة الحقول", upload_success: "تم رفع وحفظ البيانات بنجاح!", sale_photo: "صورة الفاتورة (اختياري)", save_sales: "حفظ المبيعات 💾", save_success: "تم الحفظ بنجاح!", share_wa: "مشاركة الفاتورة عبر واتساب 💬", recent_sales: "مبيعاتي الأخيرة", att_title: "تسجيل الحضور اليومي", att_desc: "سيطلب التطبيق إذن الموقع (GPS) لتوثيق حضورك في الفرع.", shift_1: "الفترة الأولى", shift_2: "الفترة الثانية", sales_by_company: "المبيعات حسب الشركة", sales_by_branch: "المبيعات حسب الفرع", top_products: "أكثر المنتجات مبيعاً", upload_stock_title: "رفع مخزون الشركة (Excel)", stock_qty: "الكمية", action: "إجراء", login_tab_promoter: "👤 دخول البروموتر", login_tab_admin: "👑 دخول الإدارة", search: "بحث 🔍", export_excel: "تصدير 📥", break_title: "وقت الراحة (البريك)", break_desc: "لك الحق في ساعة راحة مقسمة إلى فترتين (30 دقيقة لكل فترة).", break_1_start: "بدء راحة 1 (30د)", break_2_start: "بدء راحة 2 (30د)", break_end: "إنهاء الراحة", break_started: "بدأ وقت الراحة", break_ended: "انتهى وقت الراحة", break_completed: "مكتملة", break_already_completed: "لقد أخذت هذه الراحة مسبقاً", admin_attendance: "📅 سجل الحضور" },
    en: { login_title: "👤 Login (Cloud)", login_subtitle: "Promoter & Sales Management", email_ph: "Email Address", pass_ph: "Password", login_btn: "Login", logout: "Logout 🚪", admin_dash: "📊 Dashboard", admin_sales: "💰 All Sales", admin_users: "👥 Promoters", admin_products: "📦 Products", admin_companies: "🏢 Companies & Stock", admin_companies_manager: "🏢 Comprehensive Companies Manager", admin_promoters: "👥 Promoters", admin_admins: "👑 Admins", prm_dash: "🏠 Home", prm_sales: "➕ Add Sales", prm_att: "⏱️ Attendance", sale_code: "Item Code", sale_price: "Price", sale_date: "Date", sale_desc: "Description", company: "Company", branch: "Branch", promoter: "Promoter", delete: "Delete", add_new_account: "Add New Account", email: "Email", password: "Password", role: "Role", role_promoter: "Promoter", role_admin: "Admin", promoter_code: "Promoter Code", target_monthly: "Monthly Target", commission_rate: "Commission Rate (%)", add_btn: "Add ➕", cancel_btn: "Cancel ✖️", edit_account_title: "Edit Account", save_btn: "Save 💾", confirm_delete: "Are you sure to delete?", upload_excel_title: "Upload Products (Excel)", excel_file: "Excel File (.xlsx)", upload_btn: "Upload 📤", fill_fields: "Please fill all fields", upload_success: "Uploaded and saved successfully!", sale_photo: "Invoice Photo (Optional)", save_sales: "Save Sales 💾", save_success: "Saved Successfully!", share_wa: "Share via WhatsApp 💬", recent_sales: "My Recent Sales", att_title: "Daily Attendance Registration", att_desc: "The app will request GPS permission to verify your branch attendance.", shift_1: "First Shift", shift_2: "Second Shift", sales_by_company: "Sales by Company", sales_by_branch: "Sales by Branch", top_products: "Top Selling Products", upload_stock_title: "Upload Company Stock (Excel)", stock_qty: "Quantity", action: "Action", login_tab_promoter: "👤 Promoter Login", login_tab_admin: "👑 Admin Login", search: "Search 🔍", export_excel: "Export 📥", break_title: "Break Time", break_desc: "You have a 1-hour break divided into two halves (30 minutes each).", break_1_start: "Start Break 1 (30m)", break_2_start: "Start Break 2 (30m)", break_end: "End Break", break_started: "Break Started", break_ended: "Break Ended", break_completed: "Completed", break_already_completed: "Break already taken", admin_attendance: "📅 Attendance Log" }
};

function t(key) { return dict[currentLang][key] || key; }
function toggleLang() { currentLang = currentLang === 'ar' ? 'en' : 'ar'; localStorage.setItem('appLang', currentLang); window.location.reload(); }
function $(id) { return document.getElementById(id); }
function showScreen(id) { document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden')); $(id).classList.remove('hidden'); }
function toast(msg, type='info') {
    let el = document.createElement('div'); el.className = 'glass-card';
    el.style.cssText = `background: ${type==='error'?'var(--rd)':'var(--gn)'}; color: #fff; margin-bottom: 10px; padding: 10px; border-radius: 8px; font-weight: bold; font-size:0.9rem;`;
    el.innerText = msg; $('toast-container').appendChild(el);
    $('toast-container').style.cssText = `position: fixed; top: 70px; left: 50%; transform: translateX(-50%); z-index: 10000; display: flex; flex-direction: column;`;
    setTimeout(() => el.remove(), 3500);
}

document.documentElement.lang = currentLang; document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
let adminEmail = 'tetoabdallah@gmail.com';
db.collection('auth_users').where('email', '==', adminEmail.toLowerCase()).get().then(snap => {
    if (snap.empty) {
        db.collection('auth_users').doc('admin_root').set({uid: 'admin_root', email: adminEmail, password: 'admin'});
        db.collection('users').doc('admin_root').set({ uid: 'admin_root', email: adminEmail, role: 'admin', promoterCode: 'ADMIN', branch: 'Main', company: 'Main', adminId: 'admin_root' });
    }
}).catch(e => console.log(e));

$('loginTitle').innerText = t('login_title'); $('loginSub').innerText = t('login_subtitle');
$('authEmail').placeholder = t('email_ph'); $('authPass').placeholder = t('pass_ph');
$('btnLogin').innerText = t('login_btn'); $('btnLang').innerText = currentLang === 'ar' ? 'English' : 'عربي';

checkAuth();

async function checkAuth() {
    try {
        let storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
            if (!currentUser || !currentUser.uid) throw new Error("Invalid user object");
            $('uiName').innerText = currentUser.email.split('@')[0];
            let docSnap = await db.collection('users').doc(currentUser.uid).get();
            if (docSnap.exists) {
                userData = docSnap.data(); currentRole = userData.role;
            } else {
                currentRole = 'promoter';
                userData = { uid: currentUser.uid, email: currentUser.email, role: currentRole, promoterCode: 'PRM-' + Math.floor(Math.random()*10000), branch: 'Main', company: 'Main', target: 0, commissionRate: 0 };
                await db.collection('users').doc(currentUser.uid).set(userData);
            }
            $('uiRole').innerText = currentRole === 'admin' ? '👑 Admin' : '👤 Promoter';
            buildNav(); showScreen('app-screen');
        } else {
            showScreen('auth-screen');
        }
    } catch(e) {
        console.error("Auth error:", e);
        localStorage.removeItem('currentUser');
        showScreen('auth-screen');
    }
    $('loader').classList.add('hidden');
}

function toggleNotifPanel() {
    let p = $('notifPanel');
    if (p.style.display === 'none') {
        p.style.display = 'flex';
        // Mark as read (hide badge)
        $('notifBadge').style.display = 'none';
        $('notifBadge').innerText = '0';
    } else {
        p.style.display = 'none';
    }
}

let notifUnsubscribe = null;
function startNotificationsListener() {
    if(notifUnsubscribe) notifUnsubscribe();
    if(currentRole !== 'promoter') return;
    $('notifBell').style.display = 'block';
    
    notifUnsubscribe = db.collection('notifications')
        .where('targetUid', 'in', ['ALL', currentUser.uid])
        .orderBy('timestamp', 'desc')
        .limit(20)
        .onSnapshot(snap => {
            let list = $('notifList');
            if(!list) return;
            list.innerHTML = '';
            let unread = 0;
            if(snap.empty) {
                list.innerHTML = '<div style="color:gray;">لا توجد إشعارات</div>';
                return;
            }
            snap.docs.forEach(doc => {
                let d = doc.data();
                // We don't have read receipts per user for 'ALL' messages, but for simplicity we just show a red dot if new messages arrived in this session
                let dateStr = d.timestamp ? new Date(d.timestamp.toDate()).toLocaleString() : 'الآن';
                list.innerHTML += `<div style="background:rgba(0,0,0,0.3); padding:8px; border-radius:5px;"><strong style="color:var(--am);">${d.title}</strong><br><span style="color:#ddd;">${d.message}</span><div style="font-size:0.7rem; color:gray; margin-top:3px;">${dateStr}</div></div>`;
                unread++;
            });
            if(unread > 0 && $('notifPanel').style.display === 'none') {
                $('notifBadge').style.display = 'block';
                $('notifBadge').innerText = unread;
            }
        });
}

let loginMode = 'promoter';
function switchLogin(mode) {
    loginMode = mode;
    if(mode === 'promoter') {
        $('tabPromoter').style.background = 'var(--am)'; $('tabAdmin').style.background = 'rgba(255,255,255,0.1)';
        $('loginTitle').innerText = t('login_tab_promoter');
        $('btnRegister').style.display = 'none';
    } else {
        $('tabAdmin').style.background = 'var(--am)'; $('tabPromoter').style.background = 'rgba(255,255,255,0.1)';
        $('loginTitle').innerText = t('login_tab_admin');
        $('btnRegister').style.display = 'block';
    }
}

async function login() {
    let e = $('authEmail').value.trim(), p = $('authPass').value.trim();
    if (!e || !p) return toast('يرجى إدخال البيانات', 'error');
    $('loader').classList.remove('hidden');
    let timeoutId = setTimeout(() => {
        $('loader').classList.add('hidden');
        $('authError').innerText = 'تأخر الاتصال بالسيرفر! يرجى تحديث الصفحة أو إيقاف مانع الإعلانات.';
        $('authError').style.display = 'block';
    }, 8000);
    try {
        let snap = await db.collection('auth_users').where('email', '==', e.toLowerCase()).where('password', '==', p).get();
        clearTimeout(timeoutId);
        if (!snap.empty) {
            let user = snap.docs[0].data();
            let profileSnap = await db.collection('users').doc(user.uid).get();
            let profile = profileSnap.exists ? profileSnap.data() : null;
            let isAdmin = (profile && profile.role === 'admin');
            if (loginMode === 'admin' && !isAdmin) { $('loader').classList.add('hidden'); $('authError').innerText = 'غير مصرح لك بالدخول للإدارة.'; $('authError').style.display = 'block'; return; }
            if (loginMode === 'promoter' && isAdmin) { $('loader').classList.add('hidden'); $('authError').innerText = 'يرجى الدخول من تبويب الإدارة.'; $('authError').style.display = 'block'; return; }
            localStorage.setItem('currentUser', JSON.stringify({uid: user.uid, email: user.email}));
            $('authError').style.display = 'none'; checkAuth();
            if(currentRole === 'promoter') startNotificationsListener();
        } else {
            $('loader').classList.add('hidden'); $('authError').innerText = 'البيانات غير صحيحة.'; $('authError').style.display = 'block';
        }
    } catch(err) { $('loader').classList.add('hidden'); toast(`خطأ: ${err.message}`, 'error'); }
}

async function registerAdmin() {
    let e = $('authEmail').value.trim(), p = $('authPass').value.trim();
    if (!e || !p) return toast('يرجى إدخال الإيميل والباسورد أولاً', 'error');
    $('loader').classList.remove('hidden');
    try {
        let snap = await db.collection('auth_users').where('email', '==', e.toLowerCase()).get();
        if (!snap.empty) {
            toast('هذا الحساب موجود بالفعل!', 'error');
        } else {
            let uid = 'usr_' + Date.now();
            await db.collection('auth_users').doc(uid).set({uid: uid, email: e.toLowerCase(), password: p});
            await db.collection('users').doc(uid).set({ uid: uid, email: e.toLowerCase(), role: 'admin', promoterCode: 'ADMIN-'+Math.floor(Math.random()*1000), branch: 'Main', company: 'Main', adminId: uid });
            toast('تم إنشاء الحساب بنجاح! يمكنك الدخول الآن.', 'success');
        }
    } catch(err) { toast(err.message, 'error'); }
    $('loader').classList.remove('hidden');
}
function logout() { localStorage.removeItem('currentUser'); checkAuth(); }

function buildNav() {
    let links = '';
    if (currentRole === 'admin') {
        links += `<li onclick="nav('admin_dash')">📊 ${t('admin_dash')}</li>`;
        links += `<li onclick="nav('admin_sales')">💰 ${t('admin_sales')}</li>`;
        links += `<li onclick="nav('admin_attendance')">${t('admin_attendance')}</li>`;
        links += `<li onclick="nav('admin_products')">${t('admin_products')}</li>`;
        
        let isMasterAdmin = (!userData.adminId || userData.adminId === currentUser.uid);
        if (isMasterAdmin) {
            links += `<li onclick="nav('admin_companies')">${t('admin_companies')}</li>`;
            links += `<li onclick="nav('admin_companies_manager')">${t('admin_companies_manager')}</li>`;
            links += `<li onclick="nav('admin_users')">👥 البروموترز</li>`;
            links += `<li onclick="nav('admin_managers')">👑 المديرين</li>`;
        }
        links += `<li onclick="nav('admin_notifications')">🔔 إرسال إشعار</li>`;
    } else {
        links += `<li onclick="nav('promoter_sales')">🛒 ${t('prm_sales')}</li>`;
        links += `<li onclick="nav('promoter_attendance')">${t('prm_att')}</li>`;
    }
    $('navLinks').innerHTML = links;
    setTimeout(() => { let lis = $('navLinks').querySelectorAll('li'); if(lis.length > 0) lis[0].click(); }, 100);
}

function nav(page) {
    let lis = $('navLinks').querySelectorAll('li'); lis.forEach(li => li.classList.remove('active'));
    let e = window.event; if(e && e.target && e.target.tagName === 'LI') e.target.classList.add('active');
    
    let content = '', title = '';
    if (page === 'promoter_dash') {
        title = t('prm_dash');
        content = `<div class="glass-card" style="margin-bottom:20px; background:linear-gradient(45deg, var(--am), #1e1b4b);"><h3 style="color:#fff; margin-bottom:15px;">مرحباً بك، ${userData.email.split('@')[0]} 👋</h3><div style="background:rgba(0,0,0,0.3); padding:15px; border-radius:10px;"><div style="display:flex; justify-content:space-between; margin-bottom:10px;"><span style="color:#ccc;">التارجت الشهري:</span><strong style="color:#fff;" id="prmTargetVal">0</strong></div><div style="width:100%; height:15px; background:rgba(255,255,255,0.1); border-radius:10px; overflow:hidden;"><div id="prmTargetBar" style="width:0%; height:100%; background:var(--gn); transition:0.5s;"></div></div><div style="display:flex; justify-content:space-between; margin-top:10px;"><span style="color:#ccc;">المبيعات الحالية: <strong style="color:#fff;" id="prmSalesVal">0</strong></span><span style="color:#ccc;">العمولة المستحقة: <strong style="color:var(--gn);" id="prmCommVal">0</strong></span></div></div></div>`;
        setTimeout(loadPromoterProgress, 100);
    }
    else if (page === 'promoter_sales') {
        title = t('prm_sales');
        content = `<div class="glass-card"><div class="grid-2"><div class="fg"><label>${t('sale_code')}</label><div style="display:flex; gap:5px;"><select id="sCode" class="input-box" onchange="autoFillProductDetails()" style="flex:1;"></select><button class="btn btn-primary" onclick="startScanner()" style="padding:0 10px; flex-shrink:0;">📸</button></div><div id="reader" style="width:100%; display:none; margin-top:5px; border-radius:5px; overflow:hidden;"></div></div><div class="fg"><label>${t('sale_price')}</label><input type="number" id="sPrice" class="input-box" readonly style="background: rgba(255,255,255,0.02);"></div><div class="fg"><label>${t('sale_photo')} 📷</label><input type="file" id="sPhoto" class="input-box" accept="image/*" capture="environment"></div><div class="fg"><label>${t('sale_desc')}</label><input type="text" id="sDesc" class="input-box" readonly style="background: rgba(255,255,255,0.02);"></div></div><button class="btn btn-primary" style="margin-top:15px;" onclick="submitSale()">${t('save_sales')}</button></div><div id="shareBox" class="glass-card hidden" style="margin-top:10px; text-align:center; background:rgba(16,185,129,0.1); border-color:var(--gn);"><h4 style="color:var(--gn); margin-bottom:10px;">${t('save_success')}</h4><button class="btn btn-success" id="btnShareWA">${t('share_wa')}</button></div><h3 style="margin-top:20px;">${t('recent_sales')}</h3><div class="search-bar"><input type="text" id="s_mySales" class="input-box" placeholder="${t('search')}..." onkeyup="filterTable('s_mySales', 'mySalesTable')"></div><div class="glass-card" style="margin-top:10px; overflow-x:auto;"><table id="mySalesTable"></table></div>`;
        setTimeout(initPromoterSales, 100);
    }
    else if (page === 'promoter_attendance') {
        title = t('prm_att');
        content = `<div class="glass-card" style="text-align:center;"><h3>${t('att_title')}</h3><p style="color:var(--tx2); margin-bottom:15px; font-size:0.9rem;">${t('att_desc')}</p><div style="max-width:300px; margin:auto; margin-bottom:15px;"><label>صورة الحضور (Selfie) 📷</label><input type="file" id="attPhoto" class="input-box" accept="image/*" capture="user"></div><div class="grid-2" style="max-width:400px; margin:auto;"><button id="btnAtt1" class="btn btn-primary" onclick="markAttendance(1)">${t('shift_1')}</button><button id="btnAtt2" class="btn btn-primary" onclick="markAttendance(2)">${t('shift_2')}</button></div><div id="locStatus" style="margin-top:10px; font-size:0.8rem; color:var(--am);"></div></div><div class="glass-card" style="text-align:center; margin-top:20px;"><h3>${t('break_title')}</h3><p style="color:var(--tx2); margin-bottom:15px; font-size:0.9rem;">${t('break_desc')}</p><div class="grid-2" style="max-width:400px; margin:auto;"><div><button id="btnBreak1" class="btn btn-primary" onclick="toggleBreak(1)">${t('break_1_start')}</button><div id="timerBreak1" style="font-size:1.2rem; font-weight:bold; margin-top:5px; color:var(--am);"></div></div><div><button id="btnBreak2" class="btn btn-primary" onclick="toggleBreak(2)">${t('break_2_start')}</button><div id="timerBreak2" style="font-size:1.2rem; font-weight:bold; margin-top:5px; color:var(--am);"></div></div></div></div><div class="glass-card" style="margin-top:20px; overflow-x:auto;"><table id="myAttTable"></table></div>`;
        setTimeout(loadMyAttendance, 100);
    }
    else if (page === 'admin_sales') {
        title = t('admin_sales');
        content = `<div class="glass-card" style="margin-bottom: 20px;"><div class="grid-3"><div class="fg"><label>من تاريخ</label><input type="date" id="salesStartDate" class="input-box"></div><div class="fg"><label>إلى تاريخ</label><input type="date" id="salesEndDate" class="input-box"></div><div class="fg" style="display:flex; align-items:flex-end;"><button class="btn btn-primary" onclick="loadAllSales()">تطبيق الفلتر 🔍</button></div></div></div><div class="search-bar"><input type="text" id="s_allSales" class="input-box" placeholder="${t('search')}..." onkeyup="filterTable('s_allSales', 'allSalesTable')"><button class="btn export-btn" onclick="exportTableToExcel('allSalesTable', 'Sales')">${t('export_excel')}</button><button class="btn btn-danger" style="margin-right:10px; padding:8px 15px;" onclick="exportSalesToPDF()">تصدير PDF 📄</button></div><div class="glass-card" style="overflow-x:auto;" id="salesTableContainer"><table id="allSalesTable"></table></div>`;
        setTimeout(loadAllSales, 100);
    }
    else if (page === 'admin_dash') {
        title = t('admin_dash');
        content = `<div class="glass-card" style="margin-bottom: 20px;"><div class="grid-3"><div class="fg"><label>من تاريخ</label><input type="date" id="dashStartDate" class="input-box"></div><div class="fg"><label>إلى تاريخ</label><input type="date" id="dashEndDate" class="input-box"></div><div class="fg" style="display:flex; align-items:flex-end;"><button class="btn btn-primary" onclick="loadDashboard()">تطبيق الفلتر 🔍</button></div></div></div>
        <div class="glass-card" style="margin-bottom: 20px;"><h3 style="color:var(--rd); margin-bottom:15px;">نواقص المخزون ⚠️</h3><div id="lowStockContainer" style="max-height: 200px; overflow-y: auto;"></div></div>
        <div class="grid-2"><div class="glass-card"><h4 style="text-align:center; margin-bottom:10px;">${t('sales_by_company')}</h4><div style="position:relative; height:300px; width:100%;"><canvas id="companyChart"></canvas></div></div><div class="glass-card"><h4 style="text-align:center; margin-bottom:10px;">${t('sales_by_branch')}</h4><div style="position:relative; height:300px; width:100%;"><canvas id="branchChart"></canvas></div></div></div><div class="glass-card" style="margin-top: 20px;"><h3 style="margin-bottom:15px;">🏆 أبطال المبيعات (أفضل 3 بروموترز)</h3><div id="leaderboardContainer" class="grid-3" style="gap:15px;"></div></div><div class="glass-card" style="margin-top: 20px;"><h3 style="margin-bottom:15px;">${t('top_products')}</h3><div id="topProductsContainer" class="grid-3"></div></div>`;
        setTimeout(loadDashboard, 100);
    }
    else if (page === 'admin_users') {
        let isPromoter = true;
        title = t('admin_promoters');
        let roleFilter = 'promoter';
        content = `<div class="glass-card" style="margin-bottom: 20px;"><h3 id="formUserTitle">${t('add_new_account')} (${t('role_promoter')})</h3><div class="grid-3" style="margin-top:15px;"><div class="fg"><label>${t('email')}</label><input type="email" id="nuEmail" class="input-box"></div><div class="fg"><label>${t('password')}</label><input type="text" id="nuPass" class="input-box"></div><input type="hidden" id="nuRole" value="${roleFilter}"><div class="fg"><label>${t('company')}</label><input type="text" id="nuCompany" class="input-box"></div><div class="fg"><label>${t('branch')}</label><input type="text" id="nuBranch" class="input-box"></div><div class="fg"><label>${t('promoter_code')}</label><input type="text" id="nuCode" class="input-box"></div><div class="fg"><label>${t('target_monthly')}</label><input type="number" id="nuTarget" class="input-box" placeholder="0"></div><div class="fg"><label>${t('commission_rate')}</label><input type="number" id="nuCommission" class="input-box" placeholder="0"></div><div class="fg" style="display:flex; flex-direction:row; gap:10px; align-items:flex-end;"><button id="btnUserAction" class="btn btn-primary" onclick="adminAddUser()">${t('add_btn')}</button><button id="btnUserCancel" class="btn btn-danger hidden" onclick="cancelEditUser()">${t('cancel_btn')}</button></div></div></div><div class="search-bar"><input type="text" id="s_usersTable" class="input-box" placeholder="${t('search')}..." onkeyup="filterTable('s_usersTable', 'usersTable')"><button class="btn export-btn" onclick="exportTableToExcel('usersTable', 'Users')">${t('export_excel')}</button></div><div class="glass-card" style="overflow-x:auto;"><table id="usersTable"></table></div>`;
        setTimeout(() => loadAdminUsers(roleFilter), 100);
    }
    else if (page === 'admin_managers') {
        title = 'إدارة المديرين';
        let roleFilter = 'sub-admin';
        content = `<div class="glass-card" style="margin-bottom: 20px;"><h3 id="formUserTitle">إضافة حساب مدير جديد</h3><div class="grid-3" style="margin-top:15px;"><div class="fg"><label>${t('email')}</label><input type="email" id="nuEmail" class="input-box"></div><div class="fg"><label>${t('password')}</label><input type="text" id="nuPass" class="input-box"></div><input type="hidden" id="nuRole" value="${roleFilter}"><div class="fg"><label>${t('company')}</label><input type="text" id="nuCompany" class="input-box"></div><div class="fg"><label>${t('branch')}</label><input type="text" id="nuBranch" class="input-box"></div><div class="fg"><label>كود المدير</label><input type="text" id="nuCode" class="input-box"></div><div class="fg" style="display:flex; flex-direction:row; gap:10px; align-items:flex-end;"><button id="btnUserAction" class="btn btn-primary" onclick="adminAddUser()">إضافة</button><button id="btnUserCancel" class="btn btn-danger hidden" onclick="cancelEditUser()">${t('cancel_btn')}</button></div></div></div><div class="search-bar"><input type="text" id="s_usersTable" class="input-box" placeholder="${t('search')}..." onkeyup="filterTable('s_usersTable', 'usersTable')"><button class="btn export-btn" onclick="exportTableToExcel('usersTable', 'Users')">${t('export_excel')}</button></div><div class="glass-card" style="overflow-x:auto;"><table id="usersTable"></table></div>`;
        setTimeout(() => loadAdminUsers(roleFilter), 100);
    }
    else if (page === 'admin_products') {
        title = t('admin_products');
        content = `<div class="glass-card" style="margin-bottom: 20px;"><h3>${t('upload_excel_title')}</h3><div class="grid-2" style="margin-top:10px;"><div class="fg"><label>${t('company')}</label><input type="text" id="prodCompany" class="input-box"></div><div class="fg"><label>${t('excel_file')}</label><input type="file" id="prodFile" class="input-box" accept=".xlsx"></div></div><div style="display:flex; gap:10px;"><button class="btn btn-primary" style="margin-top: 10px; width:200px;" onclick="uploadProductsExcel()">${t('upload_btn')}</button><button class="btn btn-danger" style="margin-top: 10px; width:200px; background:var(--rd);" onclick="deleteAllProducts()">مسح جميع المنتجات 🗑️</button></div></div><div class="search-bar"><input type="text" id="s_productsTable" class="input-box" placeholder="${t('search')}..." onkeyup="filterTable('s_productsTable', 'productsTable')"><button class="btn export-btn" onclick="exportTableToExcel('productsTable', 'Products')">${t('export_excel')}</button></div><div class="glass-card" style="overflow-x:auto;"><table id="productsTable"></table></div>`;
        setTimeout(loadAdminProducts, 100);
    }
    else if (page === 'admin_companies') {
        title = t('admin_companies');
        content = `<div class="glass-card" style="margin-bottom: 20px;"><h3>${t('upload_stock_title')}</h3><div class="grid-2" style="margin-top:10px;"><div class="fg"><label>${t('company')}</label><input type="text" id="stockCompany" class="input-box"></div><div class="fg"><label>${t('excel_file')}</label><input type="file" id="stockFile" class="input-box" accept=".xlsx"></div></div><div style="display:flex; gap:10px;"><button class="btn btn-primary" style="margin-top: 10px; width:200px;" onclick="uploadStockExcel()">${t('upload_btn')}</button><button class="btn btn-danger" style="margin-top: 10px; width:200px; background:var(--rd);" onclick="deleteAllStock()">مسح جميع المنتجات 🗑️</button></div></div><div class="search-bar"><input type="text" id="s_stockTable" class="input-box" placeholder="${t('search')}..." onkeyup="filterTable('s_stockTable', 'stockTable')"><button class="btn export-btn" onclick="exportTableToExcel('stockTable', 'Stock')">${t('export_excel')}</button></div><div class="glass-card" style="overflow-x:auto;"><table id="stockTable"></table></div>`;
        setTimeout(loadAdminStock, 100);
    }
    else if (page === 'admin_attendance') {
        title = t('admin_attendance');
        content = `<div class="search-bar"><input type="text" id="s_allAtt" class="input-box" placeholder="${t('search')}..." onkeyup="filterTable('s_allAtt', 'allAttTable')"><button class="btn export-btn" onclick="exportTableToExcel('allAttTable', 'Attendance')">${t('export_excel')}</button></div><div class="glass-card" style="overflow-x:auto;"><table id="allAttTable"></table></div>`;
        setTimeout(loadAllAttendance, 100);
    }
    else if (page === 'admin_notifications') {
        title = 'إرسال الإشعارات';
        content = `<div class="glass-card"><h3>إرسال إشعار جديد للمندوبين</h3>
        <div class="grid-2">
            <div class="fg"><label>العنوان</label><input type="text" id="notifTitle" class="input-box" placeholder="مثال: تحديث التارجت"></div>
            <div class="fg"><label>المستهدف</label><select id="notifTarget" class="input-box"><option value="ALL">الجميع (ALL)</option></select></div>
        </div>
        <div class="fg"><label>الرسالة</label><textarea id="notifMsg" class="input-box" rows="3" placeholder="محتوى الإشعار..."></textarea></div>
        <button class="btn btn-primary" onclick="sendNotification()">إرسال 🚀</button>
        </div>`;
        setTimeout(loadNotifTargets, 100);
    }
    else if (page === 'admin_companies_manager') {
        title = t('admin_companies_manager');
        content = `<div class="glass-card" style="margin-bottom: 20px;">
            <h3>إضافة شركة جديدة</h3>
            <div class="grid-2" style="margin-top:10px;">
                <div class="fg"><label>اسم الشركة</label><input type="text" id="newCmpName" class="input-box"></div>
                <div class="fg" style="display:flex; align-items:flex-end;"><button class="btn btn-primary" onclick="addCompanyToSystem()">إضافة الشركة</button></div>
            </div>
        </div>
        <div class="glass-card">
            <h3>الشركات</h3>
            <div id="cmpList" class="grid-3"></div>
        </div>
        <div id="cmpDetailsModal" class="glass-card hidden" style="margin-top:20px; border:2px solid var(--am);">
            <h3 id="cmpDetailsTitle" style="color:var(--am); margin-bottom:15px;"></h3>
            <div class="grid-2">
                <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:8px;">
                    <h4>إضافة فرع</h4>
                    <input type="text" id="newBrnName" class="input-box" style="margin:10px 0;">
                    <button class="btn btn-success" onclick="addBranchToSystem()">حفظ الفرع</button>
                    <ul id="cmpBranchesList" style="margin-top:10px; color:var(--tx2);"></ul>
                </div>
                <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:8px;">
                    <h4>البروموترز التابعين للشركة</h4>
                    <ul id="cmpPromotersList" style="margin-top:10px; color:var(--tx2); list-style:none;"></ul>
                </div>
                <div style="grid-column: 1 / -1; background:rgba(255,255,255,0.05); padding:15px; border-radius:8px;">
                    <h4>رفع مخزون الشركة (إكسيل)</h4>
                    <div class="grid-2" style="margin-top:10px;">
                        <input type="file" id="cmpStockFile" class="input-box" accept=".xlsx">
                        <button class="btn btn-primary" onclick="uploadCmpStockExcel()">رفع المخزون 📤</button>
                    </div>
                </div>
                <div style="grid-column: 1 / -1; background:rgba(255,255,255,0.05); padding:15px; border-radius:8px; margin-top:15px;">
                    <h4>منتجات ومخزون الشركة</h4>
                    <div style="overflow-x:auto; margin-top:10px;">
                        <table id="cmpStockTable"></table>
                    </div>
                </div>
                <div style="grid-column: 1 / -1; background:rgba(255,255,255,0.05); padding:15px; border-radius:8px; margin-top:15px;">
                    <h4>منتجات الشركة (إضافة سريعة يدوية)</h4>
                    <div class="grid-3" style="margin-top:10px;">
                        <input type="text" id="newPrdCode" class="input-box" placeholder="كود الصنف">
                        <input type="text" id="newPrdDesc" class="input-box" placeholder="الوصف">
                        <input type="number" id="newPrdPrice" class="input-box" placeholder="السعر">
                        <input type="number" id="newPrdStock" class="input-box" placeholder="المخزون المتوفر">
                        <button class="btn btn-primary" style="grid-column: 1 / -1;" onclick="addFastProduct()">إضافة المنتج</button>
                    </div>
                </div>
            </div>
        </div>`;
        setTimeout(loadCompaniesManagerUI, 100);
    }
    $('pageTitle').innerText = title; $('pageContent').innerHTML = content;
}

async function loadPromoterProgress() {
    let target = userData.target || 0, commRate = userData.commissionRate || 0;
    $('prmTargetVal').innerText = target;
    try {
        let d = new Date(), monthStart = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
        let snap = await db.collection('sales').where('uid', '==', currentUser.uid).where('timestamp', '>=', new Date(monthStart)).get();
        let totalSales = 0; snap.docs.forEach(doc => totalSales += doc.data().price);
        $('prmSalesVal').innerText = totalSales;
        let p = target > 0 ? Math.min((totalSales / target) * 100, 100) : 0;
        $('prmTargetBar').style.width = p + '%';
        $('prmCommVal').innerText = ((totalSales * commRate) / 100).toFixed(2);
    } catch(err) {}
}

let cachedProducts = [];
async function initPromoterSales() {
    $('loader').classList.remove('hidden');
    try {
        let snap = await db.collection('products').where('adminId', '==', userData.adminId || currentUser.uid).get();
        cachedProducts = snap.docs.map(d => ({id: d.id, ...d.data()}));
        let select = $('sCode');
        if(select) {
            select.innerHTML = `<option value="">اختر الصنف</option>`;
            cachedProducts.forEach(p => { select.innerHTML += `<option value="${p.itemCode}">${p.itemCode} - ${p.description} (${p.company || 'بدون شركة'})</option>`; });
        }
        loadMySales();
    } catch(err) { $('loader').classList.add('hidden'); }
}

let html5QrcodeScanner = null;
function startScanner() {
    let readerDiv = $('reader');
    if (readerDiv.style.display === 'block') {
        if(html5QrcodeScanner) { html5QrcodeScanner.clear(); }
        readerDiv.style.display = 'none';
        return;
    }
    readerDiv.style.display = 'block';
    html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: {width: 250, height: 250} }, false);
    html5QrcodeScanner.render((decodedText, decodedResult) => {
        let found = cachedProducts.find(p => p.itemCode === decodedText);
        if (found) {
            $('sCode').value = decodedText;
            autoFillProductDetails();
            toast('تم التقاط الكود', 'success');
            html5QrcodeScanner.clear();
            readerDiv.style.display = 'none';
        } else { toast('الكود غير مسجل', 'error'); }
    }, (error) => {});
}

function autoFillProductDetails() {
    let prod = cachedProducts.find(p => p.itemCode === $('sCode').value);
    if(prod) { $('sPrice').value = prod.price; $('sDesc').value = prod.description; } else { $('sPrice').value = ''; $('sDesc').value = ''; }
}

async function submitSale() {
    let c = $('sCode').value, p = $('sPrice').value, desc = $('sDesc').value, photo = $('sPhoto').files[0];
    if(!c || !p) return toast('يرجى اختيار الصنف', 'error');
    $('loader').classList.remove('hidden');
    try {
        let imageUrl = '';
        if (photo) {
            let storageRef = storage.ref(`receipts/${currentUser.uid}_${Date.now()}_${photo.name}`);
            let uploadTask = await storageRef.put(photo);
            imageUrl = await uploadTask.ref.getDownloadURL();
        }
        let commEarned = (Number(p) * (userData.commissionRate || 0)) / 100;
        
        if (!navigator.onLine) {
            let offlineQueue = JSON.parse(localStorage.getItem('offlineSales') || '[]');
            offlineQueue.push({
                uid: currentUser.uid, promoterCode: userData.promoterCode, branch: userData.branch, company: userData.company,
                itemCode: c, price: Number(p), description: desc, commission: commEarned, imageUrl: imageUrl,
                date: new Date().toISOString().split('T')[0], time: new Date().toTimeString().split(' ')[0]
            });
            localStorage.setItem('offlineSales', JSON.stringify(offlineQueue));
            toast('تم الحفظ محلياً (بدون إنترنت). يرجى المزامنة لاحقاً!', 'success');
            $('sCode').value = ''; $('sPrice').value = ''; $('sDesc').value = ''; $('sPhoto').value = '';
            loadMySales();
            checkOfflineQueue();
            $('loader').classList.add('hidden');
            return;
        }

        await db.collection('sales').doc().set({
        uid: currentUser.uid,
        adminId: userData.adminId || currentUser.uid, promoterCode: userData.promoterCode, branch: userData.branch, company: userData.company,
            itemCode: c, price: Number(p), description: desc, commission: commEarned, imageUrl: imageUrl,
            date: new Date().toISOString().split('T')[0], time: new Date().toTimeString().split(' ')[0], timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        try {
            let stockSnap = await db.collection('company_stock').where('company', '==', userData.company).where('code', '==', c).where('adminId', '==', userData.adminId || currentUser.uid).get();
            if (!stockSnap.empty) {
                let stockDoc = stockSnap.docs[0];
                let currentQty = Number(stockDoc.data().quantity);
                if (currentQty > 0) {
                    await db.collection('company_stock').doc(stockDoc.id).update({ quantity: currentQty - 1 });
                }
            }
        } catch(e) { console.error("Stock deduction failed", e); }
        toast('تم الحفظ بنجاح', 'success');
        $('sCode').value = ''; $('sPrice').value = ''; $('sDesc').value = ''; $('sPhoto').value = '';
        $('shareBox').classList.remove('hidden');
        let text = `فاتورة مبيعات:\nالشركة: ${userData.company}\nالصنف: ${c}\nالسعر: ${p}\nشكراً لتعاملكم!`;
        $('btnShareWA').onclick = () => window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        loadMySales();
    } catch(err) { toast(err.message, 'error'); $('loader').classList.add('hidden'); }
}

async function loadMySales() {
    let tb = $('mySalesTable'); if(!tb) return;
    tb.innerHTML = `<tr><th>الكود</th><th>الوصف</th><th>السعر</th><th>صورة</th><th>طباعة</th></tr>`;
    try {
        let snap = await db.collection('sales').where('uid', '==', currentUser.uid).orderBy('timestamp', 'desc').limit(10).get();
        let htmlAcc = "";
        snap.docs.forEach(doc => {
            let d = doc.data(); let imgLink = d.imageUrl ? `<a href="${d.imageUrl}" target="_blank" style="color:var(--am);">عرض</a>` : '-';
            let printBtn = `<button class="btn btn-primary" style="padding:2px 8px; font-size:0.8rem;" onclick="printReceipt('${d.itemCode}', '${d.price}', '${d.date}')">🖨️</button>`;
            htmlAcc += `<tr><td>${d.itemCode}</td><td>${d.description}</td><td>${d.price}</td><td>${imgLink}</td><td>${printBtn}</td></tr>`;
        });
        tb.innerHTML += htmlAcc;
    } catch(err) {}
    $('loader').classList.add('hidden');
}

function printReceipt(code, price, date) {
    let receiptWindow = window.open('', '_blank', 'width=300,height=400');
    receiptWindow.document.write(`
        <html><head><style>
            body { font-family: monospace; width: 250px; text-align: center; margin: 0; padding: 10px; }
            h2 { margin: 5px 0; }
            .line { border-bottom: 1px dashed #000; margin: 10px 0; }
        </style></head>
        <body dir="rtl">
            <h2>Promoter Pro</h2>
            <div class="line"></div>
            <p>التاريخ: ${date}</p>
            <p>كود الصنف: ${code}</p>
            <p>السعر: ${price}</p>
            <div class="line"></div>
            <p>شكراً لتعاملكم معنا!</p>
            <script>setTimeout(()=>{window.print(); window.close();},500);<\/script>
        </body></html>
    `);
}

function resizeImage(file, max_size) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = function(e) {
            let img = new Image();
            img.onload = function() {
                let canvas = document.createElement('canvas');
                let w = img.width, h = img.height;
                if (w > h) { if (w > max_size) { h *= max_size / w; w = max_size; } }
                else { if (h > max_size) { w *= max_size / h; h = max_size; } }
                canvas.width = w; canvas.height = h;
                let ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL('image/jpeg', 0.5));
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function markAttendance(slot) {
    let f = $('attPhoto') ? $('attPhoto').files[0] : null;
    if (!f) return toast('يرجى التقاط سيلفي الحضور أولاً', 'error');
    $('locStatus').innerText = "جاري تحضير الصورة وتحديد الموقع...";
    $('loader').classList.remove('hidden');
    try {
        let b64 = await resizeImage(f, 600);
        if (!navigator.geolocation) return processAttendance(slot, null, b64);
        navigator.geolocation.getCurrentPosition(
            pos => { processAttendance(slot, `${pos.coords.latitude},${pos.coords.longitude}`, b64); },
            err => { toast('تعذر جلب الموقع الجغرافي', 'error'); processAttendance(slot, null, b64); }
        );
    } catch(err) { toast('خطأ في معالجة الصورة', 'error'); $('loader').classList.add('hidden'); }
}

async function processAttendance(slot, loc, photoBase64) {
    $('locStatus').innerText = ""; 
    
    if (!navigator.onLine) {
        let offAtt = JSON.parse(localStorage.getItem('offlineAtt') || '[]');
        offAtt.push({slot: slot, loc: loc, photo: photoBase64, uid: currentUser.uid});
        localStorage.setItem('offlineAtt', JSON.stringify(offAtt));
        toast('تم حفظ الحضور محلياً. لا تنسَ المزامنة!', 'success');
        if($('attPhoto')) $('attPhoto').value = '';
        checkOfflineQueue();
        $('loader').classList.add('hidden');
        return;
    }

    try {
        let d = new Date().toISOString().split('T')[0];
        let docRef = db.collection('attendance').doc(currentUser.uid + "_" + d);
        let docSnap = await docRef.get();
        let data = docSnap.exists ? docSnap.data() : { uid: currentUser.uid, date: d, timestamp: firebase.firestore.FieldValue.serverTimestamp() };
        if (slot === 1) { data.slot1 = true; data.loc1 = loc; data.photo1 = photoBase64; }
        if (slot === 2) { data.slot2 = true; data.loc2 = loc; data.photo2 = photoBase64; }
        await docRef.set(data, {merge: true});
        toast('تم الحضور', 'success'); 
        if($('attPhoto')) $('attPhoto').value = '';
        loadMyAttendance();
    } catch(err) { toast(err.message, 'error'); $('loader').classList.add('hidden'); }
}

let breakIntervals = {};
async function toggleBreak(b) {
    $('loader').classList.remove('hidden');
    try {
        let d = new Date().toISOString().split('T')[0];
        let docRef = db.collection('attendance').doc(currentUser.uid + "_" + d);
        let docSnap = await docRef.get();
        let data = docSnap.exists ? docSnap.data() : { uid: currentUser.uid, date: d, timestamp: firebase.firestore.FieldValue.serverTimestamp() };
        let now = Date.now();
        let breakKey = 'break' + b;
        if (!data[breakKey]) {
            data[breakKey] = { start: now, end: null };
            await docRef.set(data, {merge: true});
            toast(t('break_started'), 'success');
        } else if (data[breakKey] && !data[breakKey].end) {
            data[breakKey].end = now;
            await docRef.set(data, {merge: true});
            toast(t('break_ended'), 'success');
        } else {
            toast(t('break_already_completed'), 'error');
        }
        loadMyAttendance();
    } catch(err) { toast(err.message, 'error'); }
    $('loader').classList.add('hidden');
}

function setupBreakUI(b, breakData) {
    let btn = $('btnBreak' + b);
    let timerDiv = $('timerBreak' + b);
    if (!btn || !timerDiv) return;
    clearInterval(breakIntervals[b]);
    timerDiv.innerText = '';
    if (!breakData) {
        btn.innerText = t('break_' + b + '_start');
        btn.disabled = false;
        btn.className = "btn btn-primary";
    } else if (breakData && !breakData.end) {
        btn.innerText = t('break_end');
        btn.className = "btn btn-danger";
        btn.disabled = false;
        breakIntervals[b] = setInterval(() => {
            let elapsed = Date.now() - breakData.start;
            let remaining = (30 * 60 * 1000) - elapsed;
            if (remaining <= 0) {
                clearInterval(breakIntervals[b]);
                timerDiv.innerText = "00:00";
                timerDiv.style.color = "red";
            } else {
                let mins = Math.floor(remaining / 60000);
                let secs = Math.floor((remaining % 60000) / 1000);
                timerDiv.innerText = `${mins}:${secs < 10 ? '0':''}${secs}`;
                timerDiv.style.color = "var(--am)";
            }
        }, 1000);
    } else if (breakData && breakData.end) {
        btn.innerText = t('break_completed');
        btn.disabled = true;
        btn.className = "btn btn-success";
        btn.style.background = "var(--gn)";
    }
}

async function loadMyAttendance() {
    let tb = $('myAttTable'); if(!tb) return;
    tb.innerHTML = `<tr><th>${t('sale_date')}</th><th>${t('shift_1')}</th><th>${t('shift_2')}</th><th>${t('break_title')}</th></tr>`;
    try {
        let snap = await db.collection('attendance').where('uid', '==', currentUser.uid).orderBy('date', 'desc').limit(10).get();
        let today = new Date().toISOString().split('T')[0];
        let htmlAcc = "";
        snap.docs.forEach(doc => {
            let d = doc.data();
            let b1 = d.break1 ? (d.break1.end ? '✅' : '⏳') : '❌';
            let b2 = d.break2 ? (d.break2.end ? '✅' : '⏳') : '❌';
            htmlAcc += `<tr><td>${d.date}</td><td>${d.slot1?'✅':'❌'}</td><td>${d.slot2?'✅':'❌'}</td><td>B1:${b1} B2:${b2}</td></tr>`;
            if (d.date === today && $('btnBreak1')) {
                setupBreakUI(1, d.break1);
                setupBreakUI(2, d.break2);
            }
        });
        tb.innerHTML += htmlAcc;
    } catch(err) {}
}

async function loadAllSales() {
    let tb = $('allSalesTable'); if(!tb) return;
    tb.innerHTML = `<tr><th>الشركة/الفرع</th><th>البروموتر</th><th>المنتج</th><th>السعر</th><th>التاريخ</th><th>صورة</th></tr>`;
    
    let sd = $('salesStartDate') ? $('salesStartDate').value : '';
    let ed = $('salesEndDate') ? $('salesEndDate').value : '';
    
    $('loader').classList.remove('hidden');
    try {
        let query = db.collection('sales').orderBy('timestamp', 'desc');
        if (sd) { let start = new Date(sd); start.setHours(0,0,0,0); query = query.where('timestamp', '>=', start); }
        if (ed) { let end = new Date(ed); end.setHours(23,59,59,999); query = query.where('timestamp', '<=', end); }
        query = query.limit(200);
        
        let snap = await query.get();
        let htmlAcc = "";
        let isMasterAdmin = (!userData.adminId || userData.adminId === currentUser.uid);
        snap.docs.forEach(doc => {
            let d = doc.data();
            if (!isMasterAdmin && d.company !== userData.company) return;
            let img = d.imageUrl ? `<a href="${d.imageUrl}" target="_blank">رابط</a>` : '-';
            htmlAcc += `<tr><td>${d.company} / ${d.branch}</td><td>${d.promoterCode}</td><td>${d.itemCode}</td><td>${d.price}</td><td>${d.date}</td><td data-exclude="true">${img}</td></tr>`;
        });
        tb.innerHTML += htmlAcc;
    } catch(err) { console.log(err); }
    $('loader').classList.add('hidden');
}

async function exportSalesToPDF() {
    $('loader').classList.remove('hidden');
    let element = document.getElementById('salesTableContainer').cloneNode(true);
    let trs = element.querySelectorAll("tr");
    trs.forEach(tr => {
        let tds = tr.querySelectorAll("td[data-exclude='true'], th[data-exclude='true']");
        tds.forEach(td => td.remove());
        if(tr.children.length > 5) {
            tr.children[5].remove();
        }
    });
    
    let opt = {
      margin:       1,
      filename:     'Sales_Report.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'landscape' }
    };
    
    html2pdf().set(opt).from(element).save().then(() => {
        $('loader').classList.add('hidden');
    });
}

async function loadDashboard() {
    let compObj = {}, brObj = {}, prodObj = {}, promoterObj = {};
    let sd = $('dashStartDate') ? $('dashStartDate').value : '';
    let ed = $('dashEndDate') ? $('dashEndDate').value : '';

    $('loader').classList.remove('hidden');
    try {
        // Low Stock
        let lsCont = $('lowStockContainer');
        if(lsCont) {
            lsCont.innerHTML = '';
            let stockSnap = await db.collection('company_stock').where('quantity', '<=', 5).limit(20).get();
            let lsHtml = "";
            stockSnap.docs.forEach(doc => {
                let s = doc.data();
                lsHtml += `<div style="padding:10px; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between;"><span>${s.company} - ${s.name} (${s.code})</span> <strong style="color:var(--rd);">${s.quantity} قطع</strong></div>`;
            });
            lsCont.innerHTML = lsHtml || '<div style="padding:10px; color:var(--gn);">المخزون ممتاز، لا يوجد نواقص.</div>';
        }

        // Sales data
        let query = db.collection('sales').orderBy('timestamp', 'desc');
        if (sd) { let start = new Date(sd); start.setHours(0,0,0,0); query = query.where('timestamp', '>=', start); }
        if (ed) { let end = new Date(ed); end.setHours(23,59,59,999); query = query.where('timestamp', '<=', end); }
        let snap = await query.limit(500).get(); 

        snap.docs.forEach(doc => {
            let d = doc.data();
            compObj[d.company] = (compObj[d.company] || 0) + d.price; brObj[d.branch] = (brObj[d.branch] || 0) + d.price;
            if(!prodObj[d.company]) prodObj[d.company] = {};
            prodObj[d.company][d.itemCode] = (prodObj[d.company][d.itemCode] || 0) + d.price;
            promoterObj[d.promoterCode] = (promoterObj[d.promoterCode] || 0) + d.price;
        });
        if(chart1) chart1.destroy();
        chart1 = new Chart(document.getElementById('companyChart').getContext('2d'), { type: 'bar', data: { labels: Object.keys(compObj), datasets: [{ label: 'Sales', data: Object.values(compObj), backgroundColor: '#3b82f6' }] }, options: { responsive: true } });
        if(chart2) chart2.destroy();
        chart2 = new Chart(document.getElementById('branchChart').getContext('2d'), { type: 'doughnut', data: { labels: Object.keys(brObj), datasets: [{ data: Object.values(brObj), backgroundColor: ['#10b981','#f59e0b','#ef4444','#8b5cf6'] }] }, options: { responsive: true } });
        
        let lbCont = $('leaderboardContainer');
        if(lbCont) {
            lbCont.innerHTML = '';
            let topPromoters = Object.entries(promoterObj).sort((a,b) => b[1] - a[1]).slice(0, 3);
            let medals = ['🥇', '🥈', '🥉'];
            
            // Get targets
            let usersSnap = await db.collection('users').where('role', '==', 'promoter').get();
            let targets = {}; usersSnap.docs.forEach(d => targets[d.data().promoterCode] = d.data().target || 0);

            let htmlAcc = "";
            topPromoters.forEach((p, i) => {
                let target = targets[p[0]] || 0;
                let pct = target > 0 ? Math.min((p[1]/target)*100, 100) : 0;
                let pctStr = pct.toFixed(1) + '%';
                htmlAcc += `<div style="background:rgba(16,185,129,0.1); border:1px solid var(--gn); padding:15px; border-radius:8px; text-align:center;">
                    <div style="font-size:3rem; margin-bottom:10px;">${medals[i] || '🏅'}</div>
                    <h4 style="margin:0 0 5px 0;">${p[0]}</h4>
                    <strong style="color:var(--gn); font-size:1.2rem;">${p[1]}</strong>
                    <div style="font-size:0.8rem; color:var(--tx2); margin-top:5px;">التارجت: ${target}</div>
                    <div style="width:100%; height:8px; background:rgba(255,255,255,0.1); border-radius:4px; margin-top:5px; overflow:hidden;"><div style="width:${pctStr}; height:100%; background:var(--gn);"></div></div>
                </div>`;
            });
            lbCont.innerHTML += htmlAcc;
        }

        let tpCont = $('topProductsContainer'); tpCont.innerHTML = '';
        for(let c in prodObj) {
            let sortedProds = Object.entries(prodObj[c]).sort((a,b) => b[1] - a[1]).slice(0, 5);
            let prodsHtml = sortedProds.map(p => `<li style="display:flex; justify-content:space-between; font-size:0.8rem; margin-top:5px; border-bottom:1px solid rgba(255,255,255,0.05);"><span>${p[0]}</span> <strong>${p[1]}</strong></li>`).join('');
            tpCont.innerHTML += `<div style="background:rgba(0,0,0,0.2); padding:15px; border-radius:8px;"><h4 style="color:var(--am); margin-bottom:10px;">${c}</h4><ul style="list-style:none; padding:0;">${prodsHtml}</ul></div>`;
        }
    } catch(err) { console.log(err); }
    $('loader').classList.add('hidden');
}

let cachedAdminUsers = [], cachedAdminAuthUsers = [];
async function adminAddUser() {
    let e = $('nuEmail').value.trim(), p = $('nuPass').value.trim(), comp = $('nuCompany').value.trim(), br = $('nuBranch').value.trim(), code = $('nuCode').value.trim(), tgt = Number($('nuTarget').value) || 0, comm = Number($('nuCommission').value) || 0, r = $('nuRole').value;
    if(!e || !p) return toast('يرجى التعبئة', 'error');
    $('loader').classList.remove('hidden');
    try {
        let snap = await db.collection('auth_users').where('email', '==', e.toLowerCase()).get();
        if (!snap.empty && !editingUserUid) { $('loader').classList.add('hidden'); return toast('البريد مستخدم مسبقاً', 'error'); }
        let uid = editingUserUid || 'usr_' + Date.now();
        await db.collection('auth_users').doc(uid).set({uid: uid, email: e.toLowerCase(), password: p});
        await db.collection('users').doc(uid).set({ uid: uid, email: e.toLowerCase(), role: r, promoterCode: code, branch: br, company: comp, target: tgt, commissionRate: comm, adminId: currentUser.uid });
        toast('تم الحفظ', 'success'); cancelEditUser(); loadAdminUsers(r);
    } catch(err) { toast(err.message, 'error'); }
    $('loader').classList.add('hidden');
}

let unsubAdminAuth = null;
let unsubAdminUsers = null;
async function loadAdminUsers(roleFilter) {
    let tb = $('usersTable'); if(!tb) return;
    $('loader').classList.remove('hidden');
    
    if (unsubAdminAuth) unsubAdminAuth();
    if (unsubAdminUsers) unsubAdminUsers();
    
    let isMasterAdmin = (!userData.adminId || userData.adminId === currentUser.uid);
    let masterUid = userData.adminId || currentUser.uid;

    unsubAdminAuth = db.collection('auth_users').onSnapshot(snap1 => {
        cachedAdminAuthUsers = snap1.docs.map(d => d.data());
    });
    
    unsubAdminUsers = db.collection('users').where('adminId', '==', masterUid).onSnapshot(snap2 => {
        cachedAdminUsers = snap2.docs.map(d => d.data());
        if(!$('usersTable')) return;
        $('usersTable').innerHTML = `<tr><th>${t('role')}</th><th>${t('email')}</th><th>${t('company')}/${t('branch')}</th><th>${t('promoter_code')}</th><th>${t('target_monthly')}</th><th>${t('commission_rate')}</th><th>${t('action')}</th></tr>`;
        let htmlAcc = "";
        cachedAdminUsers.forEach(u => {
            if (roleFilter && u.role !== roleFilter) return;
            if (!isMasterAdmin && u.company !== userData.company) return;
            htmlAcc += `<tr><td><span class="badge">${u.role}</span></td><td>${u.email}</td><td>${u.company} / ${u.branch}</td><td>${u.promoterCode}</td><td>${u.target || 0}</td><td>${u.commissionRate || 0}%</td>
                <td><button class="btn btn-primary" style="padding:6px; font-size:12px;" onclick="editUser('${u.uid}')">✏️</button> <button class="btn btn-danger" style="padding:6px; font-size:12px;" onclick="deleteUser('${u.uid}', '${roleFilter}')">❌</button></td></tr>`;
        });
        $('usersTable').innerHTML += htmlAcc;
        $('loader').classList.add('hidden');
    });
}

function editUser(uid) {
    let u = cachedAdminUsers.find(x => x.uid === uid), au = cachedAdminAuthUsers.find(x => x.uid === uid);
    if(!u || !au) return;
    editingUserUid = uid;
    $('nuEmail').value = u.email; $('nuPass').value = au.password; $('nuCompany').value = u.company; $('nuBranch').value = u.branch; $('nuCode').value = u.promoterCode; $('nuTarget').value = u.target || 0; $('nuCommission').value = u.commissionRate || 0; $('nuRole').value = u.role || 'promoter';
    $('formUserTitle').innerText = 'تعديل بيانات الحساب'; $('btnUserAction').innerText = 'حفظ 💾'; $('btnUserCancel').classList.remove('hidden'); window.scrollTo({top: 0, behavior: 'smooth'});
}
function cancelEditUser() {
    editingUserUid = null; $('nuEmail').value = ''; $('nuPass').value = ''; $('nuCompany').value = ''; $('nuBranch').value = ''; $('nuCode').value = ''; $('nuTarget').value = ''; $('nuCommission').value = ''; $('btnUserAction').innerText = 'إضافة ➕'; $('btnUserCancel').classList.add('hidden');
}
async function deleteUser(uid, roleFilter) {
    if(!confirm('حذف؟')) return;
    await db.collection('auth_users').doc(uid).delete(); await db.collection('users').doc(uid).delete(); loadAdminUsers(roleFilter);
}

async function uploadProductsExcel() {
    let compInput = $('prodCompany').value.trim(), fileInput = $('prodFile');
    if(!fileInput.files.length) return toast('يرجى اختيار ملف الإكسيل', 'error');
    
    $('loader').classList.remove('hidden');
    let reader = new FileReader();
    reader.onload = async function(e) {
        try {
            let data = new Uint8Array(e.target.result), workbook = XLSX.read(data, {type: 'array'});
            let json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {header: 1});
            if(json.length < 2) throw new Error("الملف فارغ");
            
            let isExportFormat = (json[0] && json[0].length >= 4 && (String(json[0][0]).includes('شركة') || String(json[0][0]).includes('Company')));
            
            if(!compInput && !isExportFormat) {
                $('loader').classList.add('hidden');
                return toast('يرجى كتابة اسم الشركة في المربع أولاً', 'error');
            }

            const batch = db.batch();
            for(let i = 1; i < json.length; i++) {
                let row = json[i];
                if(row.length > 0) {
                    let c, code, desc, price;
                    if(isExportFormat) {
                        c = row[0] ? String(row[0]).trim() : compInput;
                        code = String(row[1] || '');
                        desc = String(row[2] || '');
                        price = Number(row[3] || 0);
                    } else {
                        c = compInput;
                        code = String(row[0] || '');
                        desc = String(row[1] || '');
                        price = Number(row[2] || 0);
                    }
                    
                    if(code && code !== 'undefined') {
                        batch.set(db.collection('products').doc(), { 
                            adminId: currentUser.uid, 
                            company: c || 'بدون شركة', 
                            itemCode: code, 
                            description: desc, 
                            price: price, 
                            timestamp: firebase.firestore.FieldValue.serverTimestamp() 
                        });
                    }
                }
            }
            await batch.commit(); 
            toast('تم الرفع بنجاح', 'success'); 
            $('prodCompany').value = ''; 
            fileInput.value = '';
        } catch(err) { console.error('Upload Error:', err); toast(err.message, 'error'); }
        $('loader').classList.add('hidden');
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
}

let unsubAdminProducts = null;
async function loadAdminProducts() {
    let tb = $('productsTable'); if(!tb) return;
    $('loader').classList.remove('hidden');
    let isMasterAdmin = (!userData.adminId || userData.adminId === currentUser.uid);
    if(unsubAdminProducts) unsubAdminProducts();
    unsubAdminProducts = db.collection('products').where('adminId', '==', userData.adminId || currentUser.uid).limit(100).onSnapshot(snap => {
        let htmlAcc = "";
        snap.docs.forEach(doc => {
            let p = doc.data();
            if (!isMasterAdmin && p.company !== userData.company) return;
            htmlAcc += `<tr><td>${p.company}</td><td>${p.itemCode}</td><td>${p.description}</td><td>${p.price}</td><td><button class="btn btn-danger" style="padding:4px;" onclick="db.collection('products').doc('${doc.id}').delete()">❌</button></td></tr>`;
        });
        $('productsTable').innerHTML = `<tr><th>${t('company')}</th><th>${t('sale_code')}</th><th>${t('sale_desc')}</th><th>${t('sale_price')}</th><th>${t('delete')}</th></tr>` + htmlAcc;
        $('loader').classList.add('hidden');
    }, err => { console.error('Load Error:', err); toast(err.message, 'error'); $('loader').classList.add('hidden'); });
}

async function deleteAllProducts() {
    if(!confirm('هل أنت متأكد من مسح جميع المنتجات المرفوعة؟ لا يمكن التراجع عن هذا الإجراء!')) return;
    $('loader').classList.remove('hidden');
    try {
        let snap = await db.collection('products').where('adminId', '==', currentUser.uid).get();
        const batch = db.batch();
        snap.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        toast('تم مسح جميع المنتجات بنجاح', 'success');
    } catch (err) {
        toast('خطأ في مسح المنتجات: ' + err.message, 'error');
    }
    $('loader').classList.add('hidden');
}
async function uploadStockExcel() {
    let compInput = $('stockCompany').value.trim(), fileInput = $('stockFile');
    if(!fileInput.files.length) return toast(t('fill_fields'), 'error');
    
    $('loader').classList.remove('hidden');
    let reader = new FileReader();
    reader.onload = async function(e) {
        try {
            let data = new Uint8Array(e.target.result), workbook = XLSX.read(data, {type: 'array'});
            let json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {header: 1});
            if(json.length < 2) throw new Error("الملف فارغ");
            
            let isExportFormat = (json[0] && json[0].length >= 5 && (String(json[0][0]).includes('شركة') || String(json[0][0]).includes('Company')));
            
            if(!compInput && !isExportFormat) {
                $('loader').classList.add('hidden');
                return toast('يرجى كتابة اسم الشركة في المربع أولاً', 'error');
            }

            const batch = db.batch();
            for(let i = 1; i < json.length; i++) {
                let row = json[i];
                if(row.length > 0) {
                    let c, code, name, price, qty;
                    if(isExportFormat) {
                        c = row[0] ? String(row[0]).trim() : compInput;
                        code = String(row[1] || '');
                        name = String(row[2] || '');
                        price = Number(row[3] || 0);
                        qty = Number(row[4] || 0);
                    } else {
                        c = compInput;
                        code = String(row[0] || '');
                        name = String(row[1] || '');
                        price = Number(row[2] || 0);
                        qty = Number(row[3] || 0);
                    }
                    
                    if(code && code !== 'undefined') {
                        let docRef = db.collection('company_stock').doc();
                        batch.set(docRef, { 
                            company: c || 'بدون شركة', 
                            code: code, 
                            name: name, 
                            price: price, 
                            quantity: qty, 
                            adminId: currentUser.uid 
                        });
                    }
                }
            }
            await batch.commit();
            toast(t('upload_success'), 'success'); 
            $('stockCompany').value = ''; 
            fileInput.value = '';
        } catch(err) { console.error('Upload Error:', err); toast('Error parsing Excel: '+err.message, 'error'); }
        $('loader').classList.add('hidden');
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
}

let unsubAdminStock = null;
function loadAdminStock() {
    let tb = $('stockTable'); if(!tb) return;
    tb.innerHTML = `<tr><th>الشركة</th><th>كود الصنف</th><th>الوصف</th><th>السعر</th><th>الكمية</th><th>حذف</th></tr>`;
    $('loader').classList.remove('hidden');
    let isMasterAdmin = (!userData.adminId || userData.adminId === currentUser.uid);
    if(unsubAdminStock) unsubAdminStock();
    unsubAdminStock = db.collection('company_stock').where('adminId', '==', userData.adminId || currentUser.uid).limit(100).onSnapshot(snap => {
        let htmlAcc = "";
        snap.docs.forEach(doc => {
            let p = doc.data();
            if (!isMasterAdmin && p.company !== userData.company) return;
            htmlAcc += `<tr><td>${p.company}</td><td>${p.code}</td><td>${p.name}</td><td>${p.price}</td><td>${p.quantity}</td><td><button class="btn btn-danger" style="padding:4px;" onclick="deleteStockItem('${doc.id}')">❌</button></td></tr>`;
        });
        $('stockTable').innerHTML += htmlAcc;
        $('loader').classList.add('hidden');
    }, err => { $('loader').classList.add('hidden'); });
}

async function deleteAllStock() {
    if(!confirm('هل أنت متأكد من مسح جميع المنتجات المرفوعة؟ لا يمكن التراجع عن هذا الإجراء!')) return;
    $('loader').classList.remove('hidden');
    try {
        let snap = await db.collection('company_stock').where('adminId', '==', currentUser.uid).get();
        const batch = db.batch();
        snap.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        toast('تم مسح جميع المنتجات بنجاح', 'success');
    } catch (err) {
        toast('خطأ في مسح المنتجات: ' + err.message, 'error');
    }
    $('loader').classList.add('hidden');
}

async function deleteStockItem(id) {
    if(!confirm(t('confirm_delete'))) return;
    await db.collection('company_stock').doc(id).delete();
}

async function loadAllAttendance() {
    let tb = $('allAttTable'); if(!tb) return;
    tb.innerHTML = `<tr><th>${t('promoter')}</th><th>${t('sale_date')}</th><th>فترة 1</th><th>فترة 2</th><th>${t('break_title')}</th></tr>`;
    $('loader').classList.remove('hidden');
    try {
        if (!cachedAdminUsers || cachedAdminUsers.length === 0) {
            let uSnap = await db.collection('users').where('adminId', '==', userData.adminId || currentUser.uid).get();
            cachedAdminUsers = uSnap.docs.map(d => d.data());
        }
        let snap = await db.collection('attendance').orderBy('date', 'desc').limit(100).get();
        let htmlAcc = "";
        let isMasterAdmin = (!userData.adminId || userData.adminId === currentUser.uid);
        snap.docs.forEach(doc => {
            let d = doc.data();
            let user = cachedAdminUsers.find(u => u.uid === d.uid);
            
            // Ignore attendance from users not managed by this admin group
            if (user && user.adminId !== (userData.adminId || currentUser.uid)) return;
            
            if (!isMasterAdmin && (!user || user.company !== userData.company)) return;
            
            let b1 = d.break1 ? (d.break1.end ? '✅' : '⏳') : '❌';
            let b2 = d.break2 ? (d.break2.end ? '✅' : '⏳') : '❌';
            let promoterName = user ? (user.email.split('@')[0] + ' (' + user.promoterCode + ')') : d.uid.substring(0,8);
            let loc1Link = d.loc1 ? `<button class="btn btn-primary" style="padding:4px 8px; font-size:12px; border-radius:4px;" onclick="window.open('https://maps.google.com/?q=${d.loc1}', '_blank')">خريطة 📍</button>` : '';
            let loc2Link = d.loc2 ? `<button class="btn btn-primary" style="padding:4px 8px; font-size:12px; border-radius:4px;" onclick="window.open('https://maps.google.com/?q=${d.loc2}', '_blank')">خريطة 📍</button>` : '';
            let pic1Link = d.photo1 ? `<button class="btn btn-success" style="padding:4px 8px; font-size:12px; border-radius:4px; margin-right:5px;" onclick="window.open('${d.photo1}', '_blank')">صورة 📷</button>` : '';
            let pic2Link = d.photo2 ? `<button class="btn btn-success" style="padding:4px 8px; font-size:12px; border-radius:4px; margin-right:5px;" onclick="window.open('${d.photo2}', '_blank')">صورة 📷</button>` : '';
            htmlAcc += `<tr><td>${promoterName}</td><td>${d.date}</td><td>${d.slot1?'✅':'❌'} <div style="margin-top:5px;">${loc1Link} ${pic1Link}</div></td><td>${d.slot2?'✅':'❌'} <div style="margin-top:5px;">${loc2Link} ${pic2Link}</div></td><td>B1:${b1} B2:${b2}</td></tr>`;
        });
        tb.innerHTML += htmlAcc;
    } catch(err) {}
    $('loader').classList.add('hidden');
}

function filterTable(inputId, tableId) {
    let input = $(inputId).value.toLowerCase();
    let table = $(tableId);
    if (!table) return;
    let trs = table.getElementsByTagName("tr");
    for (let i = 1; i < trs.length; i++) {
        let text = trs[i].textContent.toLowerCase();
        trs[i].style.display = text.indexOf(input) > -1 ? "" : "none";
    }
}

function exportTableToExcel(tableId, filename) {
    let table = $(tableId);
    if (!table) return;
    let wb = XLSX.utils.table_to_book(table, {sheet: "Sheet1"});
    XLSX.writeFile(wb, filename + "_" + Date.now() + ".xlsx");
}

function checkOfflineQueue() {
    let sales = JSON.parse(localStorage.getItem('offlineSales') || '[]');
    let atts = JSON.parse(localStorage.getItem('offlineAtt') || '[]');
    let total = sales.length + atts.length;
    let syncBtn = $('syncBtn');
    if (!syncBtn) {
        syncBtn = document.createElement('button');
        syncBtn.id = 'syncBtn';
        syncBtn.className = 'btn btn-primary';
        syncBtn.style.cssText = 'position:fixed; bottom:20px; left:20px; z-index:999; box-shadow:0 4px 6px rgba(0,0,0,0.3); font-weight:bold; font-size:1.1rem; padding:10px 20px; border-radius:20px;';
        syncBtn.onclick = syncOfflineData;
        document.body.appendChild(syncBtn);
    }
    if (total > 0) {
        syncBtn.innerText = `🔄 مزامنة (${total})`;
        syncBtn.style.display = 'block';
    } else {
        syncBtn.style.display = 'none';
    }
}
window.addEventListener('online', checkOfflineQueue);
setInterval(checkOfflineQueue, 15000);

async function syncOfflineData() {
    if (!navigator.onLine) return toast('لا يوجد اتصال بالإنترنت حالياً', 'error');
    $('loader').classList.remove('hidden');
    try {
        let sales = JSON.parse(localStorage.getItem('offlineSales') || '[]');
        let atts = JSON.parse(localStorage.getItem('offlineAtt') || '[]');
        for (let s of sales) {
            s.timestamp = firebase.firestore.FieldValue.serverTimestamp();
            s.adminId = userData.adminId || currentUser.uid; await db.collection('sales').doc().set(s);
            try {
                let stockSnap = await db.collection('company_stock').where('company', '==', s.company).where('code', '==', s.itemCode).where('adminId', '==', userData.adminId || currentUser.uid).get();
                if (!stockSnap.empty) {
                    let stockDoc = stockSnap.docs[0];
                    let currentQty = Number(stockDoc.data().quantity);
                    if (currentQty > 0) await db.collection('company_stock').doc(stockDoc.id).update({ quantity: currentQty - 1 });
                }
            } catch(e) {}
        }
        localStorage.removeItem('offlineSales');
        
        for (let a of atts) {
            let d = new Date().toISOString().split('T')[0];
            let docRef = db.collection('attendance').doc(a.uid + "_" + d);
            let docSnap = await docRef.get();
            let data = docSnap.exists ? docSnap.data() : { uid: a.uid, date: d, timestamp: firebase.firestore.FieldValue.serverTimestamp() };
            if (a.slot === 1) { data.slot1 = true; data.loc1 = a.loc; data.photo1 = a.photo; }
            if (a.slot === 2) { data.slot2 = true; data.loc2 = a.loc; data.photo2 = a.photo; }
            await docRef.set(data, {merge: true});
        }
        localStorage.removeItem('offlineAtt');
        
        toast('تمت مزامنة البيانات بنجاح! 🚀', 'success');
        checkOfflineQueue();
        setTimeout(() => window.location.reload(), 1000);
    } catch(err) { toast('فشلت المزامنة: ' + err.message, 'error'); }
    $('loader').classList.add('hidden');
}

let currentSelectedCompany = { id: null, name: null };

async function addCompanyToSystem() {
    let name = $('newCmpName').value.trim();
    if (!name) return toast('يرجى كتابة اسم الشركة', 'error');
    $('loader').classList.remove('hidden');
    try {
        let snap = await db.collection('companies_list').where('name', '==', name).where('adminId', '==', currentUser.uid).get();
        if (!snap.empty) {
            toast('الشركة موجودة بالفعل', 'error');
        } else {
            await db.collection('companies_list').add({ name: name, adminId: currentUser.uid, branches: [] });
            toast('تم إضافة الشركة بنجاح', 'success');
            $('newCmpName').value = '';
        }
    } catch(err) { toast(err.message, 'error'); }
    $('loader').classList.add('hidden');
}

let unsubCompaniesList = null;
function loadCompaniesManagerUI() {
    if(unsubCompaniesList) unsubCompaniesList();
    unsubCompaniesList = db.collection('companies_list').where('adminId', '==', currentUser.uid).onSnapshot(snap => {
        let cont = $('cmpList');
        if (!cont) return;
        cont.innerHTML = '';
        snap.forEach(doc => {
            let d = doc.data();
            cont.innerHTML += `<div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:8px; cursor:pointer; text-align:center; border:1px solid rgba(255,255,255,0.1);" onclick="showCompanyDetails('${doc.id}', '${d.name}')">
                <h4>${d.name}</h4>
                <p style="font-size:0.8rem; color:var(--tx2);">فروع: ${d.branches ? d.branches.length : 0}</p>
                <button class="btn btn-danger" style="margin-top:10px; padding:5px; font-size:0.8rem;" onclick="event.stopPropagation(); deleteCompanyFromSystem('${doc.id}')">حذف</button>
            </div>`;
        });
    });
}

async function deleteCompanyFromSystem(id) {
    if(!confirm('هل أنت متأكد من حذف الشركة؟')) return;
    $('loader').classList.remove('hidden');
    await db.collection('companies_list').doc(id).delete();
    if (currentSelectedCompany.id === id) $('cmpDetailsModal').classList.add('hidden');
    $('loader').classList.add('hidden');
    toast('تم الحذف', 'success');
}

let unsubManageCompanyDoc = null;
let unsubManageCompanyPromoters = null;
let unsubManageCompanyStock = null;

function showCompanyDetails(id, name) {
    currentSelectedCompany = {id: id, name: name};
    $('cmpDetailsTitle').innerText = 'تفاصيل الشركة: ' + name;
    $('cmpDetailsModal').classList.remove('hidden');
    
    if(unsubManageCompanyDoc) unsubManageCompanyDoc();
    unsubManageCompanyDoc = db.collection('companies_list').doc(id).onSnapshot(doc => {
        if (!doc.exists) return;
        let d = doc.data();
        let blist = $('cmpBranchesList');
        if(blist) {
            blist.innerHTML = '';
            (d.branches || []).forEach((b, idx) => {
                blist.innerHTML += `<li style="margin-bottom:5px;">- ${b} <span style="color:var(--rd); cursor:pointer; margin-right:10px;" onclick="removeBranch(${idx})">✖</span></li>`;
            });
        }
    });

    if(unsubManageCompanyPromoters) unsubManageCompanyPromoters();
    unsubManageCompanyPromoters = db.collection('users').where('company', '==', name).where('adminId', '==', currentUser.uid).onSnapshot(snap => {
        let plist = $('cmpPromotersList');
        if(plist) {
            plist.innerHTML = '';
            snap.forEach(doc => {
                let u = doc.data();
                plist.innerHTML += `<li style="margin-bottom:5px;">👤 ${u.email.split('@')[0]} (${u.promoterCode}) - فرع: ${u.branch}</li>`;
            });
        }
    });

    if(unsubManageCompanyStock) unsubManageCompanyStock();
    unsubManageCompanyStock = db.collection('company_stock').where('company', '==', name).where('adminId', '==', currentUser.uid).onSnapshot(snap => {
        let stb = $('cmpStockTable');
        if(stb) {
            stb.innerHTML = `<tr><th>الكود</th><th>الوصف</th><th>السعر</th><th>الكمية</th></tr>`;
            let htmlAcc = "";
            snap.forEach(doc => {
                let d = doc.data();
                htmlAcc += `<tr><td>${d.code}</td><td>${d.name}</td><td>${d.price}</td><td><strong style="color:var(--gn);">${d.quantity}</strong></td></tr>`;
            });
            stb.innerHTML += htmlAcc;
        }
    });
}

async function uploadCmpStockExcel() {
    let compName = currentSelectedCompany.name, fileInput = $('cmpStockFile');
    if(!compName) return toast('يرجى اختيار شركة أولاً', 'error');
    if(!fileInput.files.length) return toast(t('fill_fields'), 'error');
    
    $('loader').classList.remove('hidden');
    let reader = new FileReader();
    reader.onload = async function(e) {
        try {
            let data = new Uint8Array(e.target.result), workbook = XLSX.read(data, {type: 'array'});
            let json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {header: 1});
            if(json.length < 2) throw new Error("الملف فارغ");
            
            const batch = db.batch();
            for(let i = 1; i < json.length; i++) {
                let row = json[i];
                if(row.length > 0) {
                    let code = String(row[0] || '');
                    let name = String(row[1] || '');
                    let price = Number(row[2] || 0);
                    let qty = Number(row[3] || 0);
                    
                    if(code && code !== 'undefined') {
                        let stockRef = db.collection('company_stock').doc();
                        batch.set(stockRef, { company: compName, code: code, name: name, price: price, quantity: qty, adminId: currentUser.uid });
                        
                        let prodRef = db.collection('products').doc();
                        batch.set(prodRef, { company: compName, itemCode: code, description: name, price: price, adminId: currentUser.uid, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
                    }
                }
            }
            await batch.commit();
            toast('تم رفع وحفظ المخزون للشركة بنجاح', 'success'); 
            fileInput.value = '';
        } catch(err) { console.error('Upload Error:', err); toast('Error parsing Excel: '+err.message, 'error'); }
        $('loader').classList.add('hidden');
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
}

async function addBranchToSystem() {
    let bname = $('newBrnName').value.trim();
    if (!bname || !currentSelectedCompany.id) return;
    $('loader').classList.remove('hidden');
    try {
        let docRef = db.collection('companies_list').doc(currentSelectedCompany.id);
        await docRef.update({
            branches: firebase.firestore.FieldValue.arrayUnion(bname)
        });
        $('newBrnName').value = '';
        toast('تم إضافة الفرع', 'success');
    } catch(err) { toast(err.message, 'error'); }
    $('loader').classList.add('hidden');
}

async function removeBranch(idx) {
    if(!confirm('حذف الفرع؟')) return;
    $('loader').classList.remove('hidden');
    try {
        let docSnap = await db.collection('companies_list').doc(currentSelectedCompany.id).get();
        let d = docSnap.data();
        d.branches.splice(idx, 1);
        await db.collection('companies_list').doc(currentSelectedCompany.id).update({ branches: d.branches });
        toast('تم الحذف', 'success');
    } catch(err) {}
    $('loader').classList.add('hidden');
}

async function addFastProduct() {
    let code = $('newPrdCode').value.trim();
    let desc = $('newPrdDesc').value.trim();
    let price = Number($('newPrdPrice').value);
    let stock = Number($('newPrdStock').value);
    if (!code || !currentSelectedCompany.name) return toast('يرجى استكمال البيانات', 'error');
    
    $('loader').classList.remove('hidden');
    try {
        let batch = db.batch();
        let prodRef = db.collection('products').doc();
        batch.set(prodRef, {
            adminId: currentUser.uid, company: currentSelectedCompany.name, itemCode: code, description: desc, price: price, timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        let stockRef = db.collection('company_stock').doc();
        batch.set(stockRef, {
            company: currentSelectedCompany.name, code: code, name: desc, price: price, quantity: stock, adminId: currentUser.uid
        });
        await batch.commit();
        toast('تم إضافة المنتج والمخزون بنجاح', 'success');
        $('newPrdCode').value = ''; $('newPrdDesc').value = ''; $('newPrdPrice').value = ''; $('newPrdStock').value = '';
    } catch(err) { toast(err.message, 'error'); }
    $('loader').classList.add('hidden');
}
async function loadNotifTargets() {
    let sel = $('notifTarget');
    if(!sel) return;
    sel.innerHTML = '<option value="ALL">الجميع (ALL)</option>';
    try {
        let snap = await db.collection('users').get();
        snap.docs.forEach(doc => {
            let d = doc.data();
            sel.innerHTML += `<option value="${d.uid}">${d.company} - ${d.branch} - ${d.email}</option>`;
        });
    } catch(err) { console.error(err); }
}

