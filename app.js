// js/app.js

// --- Firebase Config & Initialization ---
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
const storage = firebase.storage();

// Enable Offline Persistence
db.enablePersistence({synchronizeTabs:true}).catch(function(err) {
    console.warn("Offline persistence error:", err.code);
});

// --- State Variables ---
let currentUser = null;
let userData = null;
let currentRole = null;
let currentLang = localStorage.getItem('appLang') || 'ar'; // default arabic
let editingUserUid = null;
let chart1 = null;
let chart2 = null;

const ADMIN_EMAILS = ['tetoabdallah@gmail.com'];

// --- Translation Dictionary ---
const dict = {
    ar: {
        login_title: "👤 تسجيل الدخول (السحابي)",
        login_subtitle: "تطبيق إدارة البروموتر والمبيعات",
        email_ph: "البريد الإلكتروني",
        pass_ph: "كلمة المرور",
        login_btn: "دخول",
        logout: "خروج 🚪",
        admin_dash: "📊 لوحة التحكم",
        admin_sales: "💰 كل المبيعات",
        admin_users: "👥 البروموترز",
        admin_products: "📦 المنتجات",
        admin_backup: "⚙️ إعدادات",
        prm_dash: "🏠 الرئيسية",
        prm_sales: "➕ مبيعات",
        prm_att: "⏱️ الحضور",
        sale_code: "كود الصنف",
        sale_price: "السعر",
        sale_date: "التاريخ",
        sale_desc: "الوصف",
        company: "الشركة",
        branch: "الفرع",
        promoter: "البروموتر",
        delete: "حذف"
    },
    en: {
        login_title: "👤 Login (Cloud)",
        login_subtitle: "Promoter & Sales Management",
        email_ph: "Email Address",
        pass_ph: "Password",
        login_btn: "Login",
        logout: "Logout 🚪",
        admin_dash: "📊 Dashboard",
        admin_sales: "💰 All Sales",
        admin_users: "👥 Promoters",
        admin_products: "📦 Products",
        admin_backup: "⚙️ Settings",
        prm_dash: "🏠 Home",
        prm_sales: "➕ Add Sales",
        prm_att: "⏱️ Attendance",
        sale_code: "Item Code",
        sale_price: "Price",
        sale_date: "Date",
        sale_desc: "Description",
        company: "Company",
        branch: "Branch",
        promoter: "Promoter",
        delete: "Delete"
    }
};

function t(key) { return dict[currentLang][key] || key; }

function toggleLang() {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('appLang', currentLang);
    window.location.reload();
}

function $(id) { return document.getElementById(id); }
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    $(id).classList.remove('hidden');
}
function toast(msg, type='info') {
    let el = document.createElement('div');
    el.className = 'glass-card';
    el.style.cssText = `background: ${type==='error'?'var(--rd)':'var(--gn)'}; color: #fff; margin-bottom: 10px; padding: 10px; border-radius: 8px; font-weight: bold; font-size:0.9rem;`;
    el.innerText = msg;
    $('toast-container').appendChild(el);
    $('toast-container').style.cssText = `position: fixed; top: 70px; left: 50%; transform: translateX(-50%); z-index: 10000; display: flex; flex-direction: column;`;
    setTimeout(() => el.remove(), 3500);
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
                uid: 'admin_root', email: adminEmail, role: 'admin', promoterCode: 'ADMIN', branch: 'Main', company: 'Main'
            });
        }
    });

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
            currentRole = 'promoter';
            userData = {
                uid: currentUser.uid, email: currentUser.email, role: currentRole,
                promoterCode: 'PRM-' + Math.floor(Math.random()*10000), branch: 'Main', company: 'Main', target: 0, commissionRate: 0
            };
            await db.collection('users').doc(currentUser.uid).set(userData);
        }
        
        $('uiRole').innerText = currentRole === 'admin' ? '👑 Admin' : '👤 Promoter';
        buildNav();
        showScreen('app-screen');
    } else {
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
    if (!e || !p) return toast('يرجى إدخال البيانات', 'error');
    
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
                $('authError').innerText = 'غير مصرح لك بالدخول للإدارة.';
                $('authError').style.display = 'block';
                return;
            }
            if (loginMode === 'promoter' && isAdmin) {
                $('loader').classList.add('hidden');
                $('authError').innerText = 'يرجى الدخول من تبويب الإدارة.';
                $('authError').style.display = 'block';
                return;
            }

            localStorage.setItem('currentUser', JSON.stringify({uid: user.uid, email: user.email}));
            $('authError').style.display = 'none';
            checkAuth();
        } else {
            $('loader').classList.add('hidden');
            $('authError').innerText = 'البيانات غير صحيحة.';
            $('authError').style.display = 'block';
        }
    } catch(err) {
        $('loader').classList.add('hidden');
        toast('خطأ في الاتصال بالإنترنت', 'error');
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
    
    if (page === 'promoter_dash') {
        title = t('prm_dash');
        content = `
            <div class="glass-card" style="margin-bottom:20px; background:linear-gradient(45deg, var(--am), #1e1b4b);">
                <h3 style="color:#fff; margin-bottom:15px;">مرحباً بك، ${userData.email.split('@')[0]} 👋</h3>
                <div style="background:rgba(0,0,0,0.3); padding:15px; border-radius:10px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                        <span style="color:#ccc;">التارجت الشهري:</span>
                        <strong style="color:#fff;" id="prmTargetVal">0</strong>
                    </div>
                    <div style="width:100%; height:15px; background:rgba(255,255,255,0.1); border-radius:10px; overflow:hidden;">
                        <div id="prmTargetBar" style="width:0%; height:100%; background:var(--gn); transition:0.5s;"></div>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-top:10px;">
                        <span style="color:#ccc;">المبيعات الحالية: <strong style="color:#fff;" id="prmSalesVal">0</strong></span>
                        <span style="color:#ccc;">العمولة المستحقة: <strong style="color:var(--gn);" id="prmCommVal">0</strong></span>
                    </div>
                </div>
            </div>
        `;
        setTimeout(loadPromoterProgress, 100);
    }
    else if (page === 'promoter_sales') {
        title = t('prm_sales');
        content = `
            <div class="glass-card">
                <div class="grid-2">
                    <div class="fg">
                        <label>${t('sale_code')}</label>
                        <select id="sCode" class="input-box" onchange="autoFillProductDetails()"></select>
                    </div>
                    <div class="fg">
                        <label>${t('sale_price')}</label>
                        <input type="number" id="sPrice" class="input-box" readonly style="background: rgba(255,255,255,0.02);">
                    </div>
                    <div class="fg">
                        <label>صورة الفاتورة (اختياري)</label>
                        <input type="file" id="sPhoto" class="input-box" accept="image/*">
                    </div>
                    <div class="fg">
                        <label>${t('sale_desc')}</label>
                        <input type="text" id="sDesc" class="input-box" readonly style="background: rgba(255,255,255,0.02);">
                    </div>
                </div>
                <button class="btn btn-primary" style="margin-top:15px;" onclick="submitSale()">حفظ المبيعات 💾</button>
            </div>
            <div id="shareBox" class="glass-card hidden" style="margin-top:10px; text-align:center; background:rgba(16,185,129,0.1); border-color:var(--gn);">
                <h4 style="color:var(--gn); margin-bottom:10px;">تم الحفظ بنجاح!</h4>
                <button class="btn btn-success" id="btnShareWA">مشاركة الفاتورة عبر واتساب 💬</button>
            </div>
            <h3 style="margin-top:20px;">مبيعاتي الأخيرة</h3>
            <div class="glass-card" style="margin-top:10px; overflow-x:auto;">
                <table id="mySalesTable"></table>
            </div>
        `;
        setTimeout(initPromoterSales, 100);
    }
    else if (page === 'promoter_attendance') {
        title = t('prm_att');
        content = `
            <div class="glass-card" style="text-align:center;">
                <h3>تسجيل الحضور اليومي</h3>
                <p style="color:var(--tx2); margin-bottom:15px; font-size:0.9rem;">سيطلب التطبيق إذن الموقع (GPS) لتوثيق حضورك في الفرع.</p>
                <div class="grid-2" style="max-width:400px; margin:auto;">
                    <button id="btnAtt1" class="btn btn-primary" onclick="markAttendance(1)">الفترة الأولى</button>
                    <button id="btnAtt2" class="btn btn-primary" onclick="markAttendance(2)">الفترة الثانية</button>
                </div>
                <div id="locStatus" style="margin-top:10px; font-size:0.8rem; color:var(--am);"></div>
            </div>
            <div class="glass-card" style="margin-top:20px;">
                <table id="myAttTable"></table>
            </div>
        `;
        setTimeout(loadMyAttendance, 100);
    }
    else if (page === 'admin_sales') {
        title = t('admin_sales');
        content = `
            <div class="glass-card" style="overflow-x:auto;">
                <table id="allSalesTable"></table>
            </div>
        `;
        setTimeout(loadAllSales, 100);
    }
    else if (page === 'admin_dash') {
        title = t('admin_dash');
        content = `
            <div class="grid-2">
                <div class="glass-card">
                    <h4 style="text-align:center; margin-bottom:10px;">المبيعات حسب الشركة</h4>
                    <canvas id="companyChart"></canvas>
                </div>
                <div class="glass-card">
                    <h4 style="text-align:center; margin-bottom:10px;">المبيعات حسب الفرع</h4>
                    <canvas id="branchChart"></canvas>
                </div>
            </div>
            <div class="glass-card" style="margin-top: 20px;">
                <h3 style="margin-bottom:15px;">أكثر المنتجات مبيعاً</h3>
                <div id="topProductsContainer" class="grid-3"></div>
            </div>
        `;
        setTimeout(loadDashboard, 100);
    }
    else if (page === 'admin_users') {
        title = t('admin_users');
        content = `
            <div class="glass-card" style="margin-bottom: 20px;">
                <h3 id="formUserTitle">إضافة حساب جديد</h3>
                <div class="grid-3" style="margin-top:15px;">
                    <div class="fg"><label>البريد</label><input type="email" id="nuEmail" class="input-box"></div>
                    <div class="fg"><label>كلمة المرور</label><input type="text" id="nuPass" class="input-box"></div>
                    <div class="fg"><label>الصلاحية</label>
                        <select id="nuRole" class="input-box">
                            <option value="promoter">بروموتر</option>
                            <option value="admin">مدير</option>
                        </select>
                    </div>
                    <div class="fg"><label>الشركة</label><input type="text" id="nuCompany" class="input-box"></div>
                    <div class="fg"><label>الفرع</label><input type="text" id="nuBranch" class="input-box"></div>
                    <div class="fg"><label>كود البروموتر</label><input type="text" id="nuCode" class="input-box"></div>
                    <div class="fg"><label>التارجت (شهري)</label><input type="number" id="nuTarget" class="input-box" placeholder="0"></div>
                    <div class="fg"><label>نسبة العمولة (%)</label><input type="number" id="nuCommission" class="input-box" placeholder="0"></div>
                    <div class="fg" style="display:flex; flex-direction:row; gap:10px; align-items:flex-end;">
                        <button id="btnUserAction" class="btn btn-primary" onclick="adminAddUser()">إضافة ➕</button>
                        <button id="btnUserCancel" class="btn btn-danger hidden" onclick="cancelEditUser()">إلغاء ✖️</button>
                    </div>
                </div>
            </div>
            <div class="glass-card" style="overflow-x:auto;">
                <table id="usersTable"></table>
            </div>
        `;
        setTimeout(loadAdminUsers, 100);
    }
    else if (page === 'admin_products') {
        title = t('admin_products');
        content = `
            <div class="glass-card" style="margin-bottom: 20px;">
                <h3>رفع المنتجات (Excel)</h3>
                <div class="grid-2" style="margin-top:10px;">
                    <div class="fg"><label>الشركة</label><input type="text" id="prodCompany" class="input-box"></div>
                    <div class="fg"><label>ملف إكسيل (.xlsx)</label><input type="file" id="prodFile" class="input-box" accept=".xlsx"></div>
                </div>
                <button class="btn btn-primary" style="margin-top: 10px; width:200px;" onclick="uploadProductsExcel()">رفع 📤</button>
            </div>
            <div class="glass-card" style="overflow-x:auto;">
                <table id="productsTable"></table>
            </div>
        `;
        setTimeout(loadAdminProducts, 100);
    }
    
    $('pageTitle').innerText = title;
    $('pageContent').innerHTML = content;
}

// --- Promoter: Progress ---
async function loadPromoterProgress() {
    let target = userData.target || 0;
    let commRate = userData.commissionRate || 0;
    
    $('prmTargetVal').innerText = target;
    
    try {
        let d = new Date();
        let monthStart = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
        let snap = await db.collection('sales')
            .where('uid', '==', currentUser.uid)
            .where('timestamp', '>=', new Date(monthStart))
            .get();
            
        let totalSales = 0;
        snap.docs.forEach(doc => totalSales += doc.data().price);
        
        $('prmSalesVal').innerText = totalSales;
        let p = target > 0 ? Math.min((totalSales / target) * 100, 100) : 0;
        $('prmTargetBar').style.width = p + '%';
        
        let earned = (totalSales * commRate) / 100;
        $('prmCommVal').innerText = earned.toFixed(2);
    } catch(err) {
        console.error(err);
    }
}

// --- Promoter: Sales ---
let cachedProducts = [];

async function initPromoterSales() {
    $('loader').classList.remove('hidden');
    try {
        let snap = await db.collection('products').where('company', '==', userData.company).get();
        cachedProducts = snap.docs.map(d => ({id: d.id, ...d.data()}));
        
        let select = $('sCode');
        if(select) {
            select.innerHTML = `<option value="">اختر الصنف</option>`;
            cachedProducts.forEach(p => {
                select.innerHTML += `<option value="${p.itemCode}">${p.itemCode} - ${p.description}</option>`;
            });
        }
        loadMySales();
    } catch(err) {
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
    let desc = $('sDesc').value;
    let photo = $('sPhoto').files[0];
    
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
        
        let docRef = db.collection('sales').doc();
        let saleData = {
            uid: currentUser.uid,
            promoterCode: userData.promoterCode,
            branch: userData.branch,
            company: userData.company,
            itemCode: c,
            price: Number(p),
            description: desc,
            commission: commEarned,
            imageUrl: imageUrl,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().split(' ')[0],
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };
        await docRef.set(saleData);
        
        toast('تم الحفظ بنجاح', 'success');
        $('sCode').value = ''; $('sPrice').value = ''; $('sDesc').value = ''; $('sPhoto').value = '';
        
        // Show share box
        $('shareBox').classList.remove('hidden');
        let text = `مرحباً بك! شكراً لتعاملك معنا.\n\nفاتورة مبيعات:\nالشركة: ${userData.company}\nالصنف: ${c}\nالسعر: ${p}\n\nنأمل رؤيتكم قريباً!`;
        $('btnShareWA').onclick = () => window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        
        loadMySales();
    } catch(err) {
        toast(err.message, 'error');
        $('loader').classList.add('hidden');
    }
}

async function loadMySales() {
    let tb = $('mySalesTable');
    if(!tb) return;
    tb.innerHTML = `<tr><th>الكود</th><th>الوصف</th><th>السعر</th><th>صورة</th></tr>`;
    try {
        let snap = await db.collection('sales').where('uid', '==', currentUser.uid).orderBy('timestamp', 'desc').limit(10).get();
        snap.docs.forEach(doc => {
            let d = doc.data();
            let imgLink = d.imageUrl ? `<a href="${d.imageUrl}" target="_blank" style="color:var(--am);">عرض</a>` : '-';
            tb.innerHTML += `<tr><td>${d.itemCode}</td><td>${d.description}</td><td>${d.price}</td><td>${imgLink}</td></tr>`;
        });
    } catch(err) { console.error(err); }
    $('loader').classList.add('hidden');
}

// --- Promoter: Attendance (GPS Tracking) ---
async function markAttendance(slot) {
    $('locStatus').innerText = "جاري تحديد الموقع...";
    if (!navigator.geolocation) {
        return processAttendance(slot, null);
    }
    navigator.geolocation.getCurrentPosition(
        pos => {
            let coords = `${pos.coords.latitude},${pos.coords.longitude}`;
            processAttendance(slot, coords);
        },
        err => {
            toast('تعذر جلب الموقع الجغرافي، تأكد من إعطاء الصلاحية.', 'error');
            processAttendance(slot, null);
        }
    );
}

async function processAttendance(slot, loc) {
    $('locStatus').innerText = "";
    $('loader').classList.remove('hidden');
    try {
        let d = new Date().toISOString().split('T')[0];
        let docId = currentUser.uid + "_" + d;
        let docRef = db.collection('attendance').doc(docId);
        let docSnap = await docRef.get();
        let data = docSnap.exists ? docSnap.data() : { uid: currentUser.uid, date: d, timestamp: firebase.firestore.FieldValue.serverTimestamp() };
        
        if (slot === 1) { data.slot1 = true; data.loc1 = loc; }
        if (slot === 2) { data.slot2 = true; data.loc2 = loc; }
        
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
    tb.innerHTML = `<tr><th>التاريخ</th><th>فترة 1</th><th>فترة 2</th></tr>`;
    try {
        let snap = await db.collection('attendance').where('uid', '==', currentUser.uid).orderBy('date', 'desc').limit(10).get();
        snap.docs.forEach(doc => {
            let d = doc.data();
            let s1 = d.slot1 ? '✅' : '❌';
            let s2 = d.slot2 ? '✅' : '❌';
            tb.innerHTML += `<tr><td>${d.date}</td><td>${s1}</td><td>${s2}</td></tr>`;
        });
    } catch(err) {}
}

// --- Admin: Sales ---
async function loadAllSales() {
    let tb = $('allSalesTable');
    if(!tb) return;
    tb.innerHTML = `<tr><th>الشركة/الفرع</th><th>البروموتر</th><th>المنتج</th><th>السعر</th><th>التاريخ</th><th>الفاتورة</th></tr>`;
    try {
        let snap = await db.collection('sales').orderBy('timestamp', 'desc').limit(50).get();
        snap.docs.forEach(doc => {
            let d = doc.data();
            let img = d.imageUrl ? `<a href="${d.imageUrl}" target="_blank">صورة</a>` : '-';
            tb.innerHTML += `<tr><td>${d.company} / ${d.branch}</td><td>${d.promoterCode}</td><td>${d.itemCode}</td><td>${d.price}</td><td>${d.date}</td><td>${img}</td></tr>`;
        });
    } catch(err) {}
}

// --- Admin: Dash (Charts) ---
async function loadDashboard() {
    let compObj = {};
    let brObj = {};
    let prodObj = {};
    
    try {
        let snap = await db.collection('sales').limit(200).get(); 
        snap.docs.forEach(doc => {
            let d = doc.data();
            compObj[d.company] = (compObj[d.company] || 0) + d.price;
            brObj[d.branch] = (brObj[d.branch] || 0) + d.price;
            if(!prodObj[d.company]) prodObj[d.company] = {};
            prodObj[d.company][d.itemCode] = (prodObj[d.company][d.itemCode] || 0) + d.price;
        });
        
        // Draw Chart 1
        if(chart1) chart1.destroy();
        let ctx1 = document.getElementById('companyChart').getContext('2d');
        chart1 = new Chart(ctx1, {
            type: 'bar',
            data: { labels: Object.keys(compObj), datasets: [{ label: 'Sales', data: Object.values(compObj), backgroundColor: '#3b82f6' }] },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });
        
        // Draw Chart 2
        if(chart2) chart2.destroy();
        let ctx2 = document.getElementById('branchChart').getContext('2d');
        chart2 = new Chart(ctx2, {
            type: 'doughnut',
            data: { labels: Object.keys(brObj), datasets: [{ data: Object.values(brObj), backgroundColor: ['#10b981','#f59e0b','#ef4444','#8b5cf6'] }] },
            options: { responsive: true }
        });
        
        // Top Products
        let tpCont = $('topProductsContainer');
        tpCont.innerHTML = '';
        for(let c in prodObj) {
            let sortedProds = Object.entries(prodObj[c]).sort((a,b) => b[1] - a[1]).slice(0, 5);
            let prodsHtml = sortedProds.map(p => `<li style="display:flex; justify-content:space-between; font-size:0.8rem; margin-top:5px; border-bottom:1px solid rgba(255,255,255,0.05);"><span>${p[0]}</span> <strong>${p[1]}</strong></li>`).join('');
            tpCont.innerHTML += `<div style="background:rgba(0,0,0,0.2); padding:15px; border-radius:8px;">
                <h4 style="color:var(--am); margin-bottom:10px;">${c}</h4><ul style="list-style:none; padding:0;">${prodsHtml}</ul>
            </div>`;
        }
    } catch(err) {}
}

// --- Admin: Users ---
let cachedAdminUsers = [];
let cachedAdminAuthUsers = [];

async function adminAddUser() {
    let e = $('nuEmail').value.trim();
    let p = $('nuPass').value.trim();
    let comp = $('nuCompany').value.trim();
    let br = $('nuBranch').value.trim();
    let code = $('nuCode').value.trim();
    let tgt = Number($('nuTarget').value) || 0;
    let comm = Number($('nuCommission').value) || 0;
    let r = $('nuRole').value;
    
    if(!e || !p) return toast('يرجى التعبئة', 'error');
    
    $('loader').classList.remove('hidden');
    try {
        let snap = await db.collection('auth_users').where('email', '==', e.toLowerCase()).get();
        if (!snap.empty && !editingUserUid) {
            $('loader').classList.add('hidden');
            return toast('مسجل بالفعل', 'error');
        }
        
        let uid = editingUserUid || 'usr_' + Date.now();
        await db.collection('auth_users').doc(uid).set({uid: uid, email: e.toLowerCase(), password: p});
        await db.collection('users').doc(uid).set({
            uid: uid, email: e.toLowerCase(), role: r,
            promoterCode: code, branch: br, company: comp, target: tgt, commissionRate: comm
        });
        
        toast('تم الحفظ', 'success');
        cancelEditUser();
        loadAdminUsers();
    } catch(err) { toast(err.message, 'error'); }
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
        
        tb.innerHTML = `<tr><th>Role</th><th>Email</th><th>Company/Branch</th><th>Code</th><th>Target</th><th>Comm.</th><th>Action</th></tr>`;
        cachedAdminUsers.forEach(u => {
            tb.innerHTML += `<tr>
                <td>${u.role}</td><td>${u.email}</td><td>${u.company} / ${u.branch}</td><td>${u.promoterCode}</td>
                <td>${u.target || 0}</td><td>${u.commissionRate || 0}%</td>
                <td>
                    <button class="btn btn-primary" style="padding:4px;" onclick="editUser('${u.uid}')">✏️</button>
                    <button class="btn btn-danger" style="padding:4px;" onclick="deleteUser('${u.uid}')">✖️</button>
                </td>
            </tr>`;
        });
    } catch(err) {}
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
    $('nuTarget').value = u.target || 0;
    $('nuCommission').value = u.commissionRate || 0;
    $('nuRole').value = u.role || 'promoter';
    
    $('formUserTitle').innerText = 'تعديل بيانات الحساب';
    $('btnUserAction').innerText = 'حفظ 💾';
    $('btnUserCancel').classList.remove('hidden');
    window.scrollTo({top: 0, behavior: 'smooth'});
}

function cancelEditUser() {
    editingUserUid = null;
    $('nuEmail').value = ''; $('nuPass').value = ''; $('nuCompany').value = '';
    $('nuBranch').value = ''; $('nuCode').value = ''; $('nuTarget').value = ''; $('nuCommission').value = '';
    $('btnUserAction').innerText = 'إضافة ➕';
    $('btnUserCancel').classList.add('hidden');
}

async function deleteUser(uid) {
    if(!confirm('حذف؟')) return;
    await db.collection('auth_users').doc(uid).delete();
    await db.collection('users').doc(uid).delete();
    loadAdminUsers();
}

// --- Admin: Products ---
async function uploadProductsExcel() {
    let comp = $('prodCompany').value.trim();
    let fileInput = $('prodFile');
    if(!comp || !fileInput.files.length) return toast('يرجى تعبئة الحقول', 'error');
    
    $('loader').classList.remove('hidden');
    let reader = new FileReader();
    reader.onload = async function(e) {
        try {
            let data = new Uint8Array(e.target.result);
            let workbook = XLSX.read(data, {type: 'array'});
            let json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {header: 1});
            
            const batch = db.batch();
            for(let i = 1; i < json.length; i++) {
                let r = json[i];
                if(r.length >= 3 && r[0]) {
                    batch.set(db.collection('products').doc(), {
                        company: comp, itemCode: String(r[0]), description: String(r[1]), price: Number(r[2]),
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
            }
            await batch.commit();
            toast('تم الرفع بنجاح', 'success');
            $('prodCompany').value = ''; fileInput.value = '';
            loadAdminProducts();
        } catch(err) { toast(err.message, 'error'); }
        $('loader').classList.add('hidden');
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
}

async function loadAdminProducts() {
    let tb = $('productsTable');
    if(!tb) return;
    tb.innerHTML = `<tr><th>الشركة</th><th>الكود</th><th>الوصف</th><th>السعر</th><th>Action</th></tr>`;
    let snap = await db.collection('products').orderBy('timestamp', 'desc').limit(50).get();
    snap.docs.forEach(doc => {
        let p = doc.data();
        tb.innerHTML += `<tr><td>${p.company}</td><td>${p.itemCode}</td><td>${p.description}</td><td>${p.price}</td>
        <td><button class="btn btn-danger" style="padding:4px;" onclick="db.collection('products').doc('${doc.id}').delete().then(loadAdminProducts)">✖️</button></td></tr>`;
    });
}
