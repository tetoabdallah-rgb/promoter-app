// js/app.js

// --- LocalDB Helper (Replaces Firebase) ---
const LocalDB = {
    get: (collection) => JSON.parse(localStorage.getItem(collection) || '[]'),
    set: (collection, data) => localStorage.setItem(collection, JSON.stringify(data)),
    add: (collection, item) => {
        let data = LocalDB.get(collection);
        item.id = Date.now().toString() + Math.random().toString().substring(2);
        item.timestamp = new Date().toISOString();
        data.push(item);
        LocalDB.set(collection, data);
        return item;
    },
    getById: (collection, id) => LocalDB.get(collection).find(i => i.id === id)
};

let currentUser = null;
let currentRole = null;
let userData = null;

const ADMIN_EMAILS = ['tetoabdallah@gmail.com'];

// --- Utility Functions ---
function $(id) { return document.getElementById(id); }
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    $(id).classList.remove('hidden');
}
function toast(msg, type='info') {
    let t = document.createElement('div');
    t.className = `glass-card`;
    t.style.cssText = `background: ${type==='error'?'var(--rd)':'var(--gn)'}; color: #fff; margin-bottom: 10px; padding: 10px; border-radius: 8px; font-weight: bold;`;
    t.innerText = msg;
    $('toast-container').appendChild(t);
    $('toast-container').style.cssText = `position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 10000; display: flex; flex-direction: column;`;
    setTimeout(() => t.remove(), 3000);
}

// --- Authentication (Local) ---
function checkAuth() {
    let storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        $('uiName').innerText = currentUser.email.split('@')[0];
        
        let users = LocalDB.get('promoter_users');
        userData = users.find(u => u.uid === currentUser.uid);
        
        if (userData) {
            currentRole = userData.role;
        } else {
            // Fallback for first time if profile wasn't created properly
            currentRole = ADMIN_EMAILS.includes(currentUser.email.toLowerCase()) ? 'admin' : 'promoter';
            userData = {
                uid: currentUser.uid,
                email: currentUser.email,
                role: currentRole,
                promoterCode: currentRole === 'promoter' ? 'PRM-' + Math.floor(Math.random()*10000) : 'ADMIN',
                branch: 'Main',
                company: 'Default'
            };
            users.push(userData);
            LocalDB.set('promoter_users', users);
        }
        
        $('uiRole').innerText = currentRole === 'admin' ? 'مدير الإدارة 👑' : 'بروموتر 👤';
        buildNav();
        showScreen('app-screen');
    } else {
        currentUser = null;
        currentRole = null;
        showScreen('auth-screen');
    }
}

// Call checkAuth when page loads
window.addEventListener('DOMContentLoaded', checkAuth);

function login() {
    let e = $('authEmail').value.trim();
    let p = $('authPass').value.trim();
    if (!e || !p) { $('authError').innerText = 'يرجى إدخال البريد وكلمة المرور'; return; }
    
    $('authError').innerText = 'جاري تسجيل الدخول...';
    setTimeout(() => {
        let authUsers = LocalDB.get('auth_users');
        let user = authUsers.find(u => u.email.toLowerCase() === e.toLowerCase() && u.password === p);
        
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify({uid: user.uid, email: user.email}));
            $('authError').innerText = '';
            checkAuth();
        } else {
            $('authError').innerText = 'البريد أو كلمة المرور غير صحيحة. هل تقصد إنشاء حساب جديد؟';
        }
    }, 500);
}

function signup() {
    let e = $('authEmail').value.trim();
    let p = $('authPass').value.trim();
    if (!e || !p) { $('authError').innerText = 'يرجى إدخال البريد وكلمة المرور'; return; }
    
    $('authError').innerText = 'جاري إنشاء الحساب...';
    setTimeout(() => {
        let authUsers = LocalDB.get('auth_users');
        if (authUsers.find(u => u.email.toLowerCase() === e.toLowerCase())) {
            $('authError').innerText = 'هذا البريد مسجل بالفعل. يرجى تسجيل الدخول.';
            return;
        }
        
        let uid = 'usr_' + Date.now();
        authUsers.push({uid: uid, email: e, password: p});
        LocalDB.set('auth_users', authUsers);
        
        // Create user profile
        let role = ADMIN_EMAILS.includes(e.toLowerCase()) ? 'admin' : 'promoter';
        let newUserData = {
            uid: uid,
            email: e,
            role: role,
            promoterCode: role === 'promoter' ? 'PRM-' + Math.floor(Math.random()*10000) : 'ADMIN',
            branch: 'Main',
            company: 'Default'
        };
        let profiles = LocalDB.get('promoter_users');
        profiles.push(newUserData);
        LocalDB.set('promoter_users', profiles);
        
        localStorage.setItem('currentUser', JSON.stringify({uid: uid, email: e}));
        $('authError').innerText = '';
        checkAuth();
    }, 500);
}

function logout() {
    localStorage.removeItem('currentUser');
    checkAuth();
}

// --- Navigation & Routing ---
let currentPage = '';

function buildNav() {
    let links = '';
    if (currentRole === 'admin') {
        links += `<li onclick="nav('admin_dash')">📊 لوحة التحكم الشاملة</li>`;
        links += `<li onclick="nav('admin_sales')">💰 كل المبيعات</li>`;
        links += `<li onclick="nav('admin_users')">👥 إدارة البروموترز</li>`;
    } else {
        links += `<li onclick="nav('promoter_dash')">🏠 الرئيسية</li>`;
        links += `<li onclick="nav('promoter_sales')">➕ إدخال مبيعات</li>`;
        links += `<li onclick="nav('promoter_attendance')">⏱️ الحضور والانصراف</li>`;
    }
    
    $('navLinks').innerHTML = links;
    
    // Auto navigate
    let lis = $('navLinks').querySelectorAll('li');
    if(lis.length > 0) lis[0].click();
}

function nav(page) {
    currentPage = page;
    let lis = $('navLinks').querySelectorAll('li');
    lis.forEach(li => li.classList.remove('active'));
    if(event && event.target && event.target.tagName === 'LI') {
        event.target.classList.add('active');
    }
    
    let content = '';
    let title = '';
    
    if (page === 'promoter_sales') {
        title = '➕ إدخال مبيعات جديدة';
        content = `
            <div class="glass-card">
                <div class="grid-2">
                    <div class="fg">
                        <label>كود الصنف</label>
                        <input type="text" id="sCode" class="input-box" placeholder="مثال: ITEM-123">
                    </div>
                    <div class="fg">
                        <label>السعر</label>
                        <input type="number" id="sPrice" class="input-box" placeholder="0">
                    </div>
                    <div class="fg">
                        <label>التاريخ</label>
                        <input type="date" id="sDate" class="input-box" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="fg">
                        <label>الوقت</label>
                        <input type="time" id="sTime" class="input-box" value="${new Date().toTimeString().split(' ')[0].substring(0,5)}">
                    </div>
                </div>
                <div class="fg">
                    <label>الوصف / الملاحظات</label>
                    <input type="text" id="sDesc" class="input-box" placeholder="اكتب تفاصيل البيعة...">
                </div>
                <button class="btn btn-primary" onclick="submitSale()">حفظ المبيعات محلياً 💾</button>
            </div>
            
            <h3 style="margin-top:20px;">مبيعاتي الأخيرة</h3>
            <div class="glass-card" style="margin-top:10px; overflow-x:auto;">
                <table id="mySalesTable">
                    <tr><th>الكود</th><th>الوصف</th><th>السعر</th><th>التاريخ</th></tr>
                </table>
            </div>
        `;
        setTimeout(loadMySales, 100);
    }
    else if (page === 'promoter_attendance') {
        title = '⏱️ الحضور والانصراف';
        content = `
            <div class="glass-card" style="text-align:center;">
                <h3>تسجيل الحضور اليومي</h3>
                <p style="color:var(--tx2); margin-bottom:15px;">الدوام مقسم إلى فترتين (نصف ساعة لكل فترة)</p>
                
                <div class="grid-2" style="max-width:400px; margin:auto;">
                    <button id="btnAtt1" class="btn btn-primary" onclick="markAttendance(1)">تسجيل حضور (الفترة 1)</button>
                    <button id="btnAtt2" class="btn btn-primary" onclick="markAttendance(2)">تسجيل حضور (الفترة 2)</button>
                </div>
                
                <div id="attStatus" style="margin-top:20px; font-weight:bold;"></div>
            </div>
            
            <div class="glass-card" style="margin-top:20px;">
                <h3>سجل الحضور</h3>
                <table id="myAttTable">
                    <tr><th>التاريخ</th><th>الفترة 1</th><th>الفترة 2</th></tr>
                </table>
            </div>
        `;
        setTimeout(loadMyAttendance, 100);
    }
    else if (page === 'admin_sales') {
        title = '💰 مبيعات كل الفروع والشركات';
        content = `
            <div class="glass-card" style="margin-bottom:15px; display:flex; gap:10px;">
                <button class="btn btn-primary" onclick="exportAdminExcel()">تصدير إكسيل 📊</button>
                <button class="btn btn-danger" onclick="clearLocalData()">مسح كل البيانات 🗑️</button>
            </div>
            <div class="glass-card" style="overflow-x:auto;">
                <table id="allSalesTable">
                    <tr><th>الشركة</th><th>الفرع</th><th>البروموتر</th><th>الكود</th><th>الوصف</th><th>السعر</th><th>التاريخ</th></tr>
                </table>
            </div>
        `;
        setTimeout(loadAllSales, 100);
    }
    else {
        title = 'لوحة التحكم';
        content = '<div class="glass-card"><p>مرحباً بك في لوحة التحكم.</p></div>';
    }
    
    $('pageTitle').innerText = title;
    $('pageContent').innerHTML = content;
}

// --- Data Operations (LocalDB) ---

function submitSale() {
    let sCode = $('sCode').value.trim();
    let sPrice = $('sPrice').value.trim();
    let sDate = $('sDate').value;
    let sTime = $('sTime').value;
    let sDesc = $('sDesc').value.trim();
    
    if(!sCode || !sPrice) { toast('يرجى إدخال الكود والسعر', 'error'); return; }
    
    $('loader').classList.remove('hidden');
    setTimeout(() => {
        try {
            LocalDB.add('promoter_sales', {
                uid: currentUser.uid,
                promoterCode: userData.promoterCode,
                branch: userData.branch,
                company: userData.company,
                itemCode: sCode,
                price: Number(sPrice),
                date: sDate,
                time: sTime,
                description: sDesc
            });
            
            toast('تم حفظ المبيعات بنجاح!', 'success');
            $('sCode').value = '';
            $('sPrice').value = '';
            $('sDesc').value = '';
            loadMySales();
        } catch(err) {
            toast('خطأ: ' + err.message, 'error');
        }
        $('loader').classList.add('hidden');
    }, 300);
}

function loadMySales() {
    let tb = $('mySalesTable');
    if(!tb) return;
    tb.innerHTML = '<tr><th>الكود</th><th>الوصف</th><th>السعر</th><th>التاريخ</th></tr>';
    
    let allSales = LocalDB.get('promoter_sales');
    let mySales = allSales.filter(s => s.uid === currentUser.uid)
                          .sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp))
                          .slice(0, 20);
                          
    mySales.forEach(d => {
        tb.innerHTML += `<tr><td>${d.itemCode}</td><td>${d.description}</td><td>${d.price}</td><td>${d.date} ${d.time}</td></tr>`;
    });
}

function loadAllSales() {
    let tb = $('allSalesTable');
    if(!tb) return;
    tb.innerHTML = '<tr><th>الشركة</th><th>الفرع</th><th>البروموتر</th><th>الكود</th><th>الوصف</th><th>السعر</th><th>التاريخ</th></tr>';
    
    let allSales = LocalDB.get('promoter_sales')
                          .sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp))
                          .slice(0, 100);
                          
    allSales.forEach(d => {
        tb.innerHTML += `<tr><td>${d.company}</td><td>${d.branch}</td><td>${d.promoterCode}</td><td>${d.itemCode}</td><td>${d.description}</td><td>${d.price}</td><td>${d.date} ${d.time}</td></tr>`;
    });
}

// --- Attendance Operations (LocalDB) ---
function markAttendance(slotNumber) {
    let today = new Date().toISOString().split('T')[0];
    let docId = currentUser.uid + '_' + today;
    
    $('loader').classList.remove('hidden');
    setTimeout(() => {
        try {
            let allAtt = LocalDB.get('promoter_attendance');
            let data = allAtt.find(a => a.id === docId);
            
            if (!data) {
                data = { id: docId, uid: currentUser.uid, date: today, slot1: false, slot2: false };
                allAtt.push(data);
            }
            
            if (slotNumber === 1) data.slot1 = true;
            if (slotNumber === 2) data.slot2 = true;
            
            LocalDB.set('promoter_attendance', allAtt);
            toast('تم تسجيل الحضور بنجاح', 'success');
            loadMyAttendance();
        } catch(err) {
            toast('خطأ: ' + err.message, 'error');
        }
        $('loader').classList.add('hidden');
    }, 300);
}

function loadMyAttendance() {
    let tb = $('myAttTable');
    if(!tb) return;
    tb.innerHTML = '<tr><th>التاريخ</th><th>الفترة 1</th><th>الفترة 2</th></tr>';
    
    let today = new Date().toISOString().split('T')[0];
    let allAtt = LocalDB.get('promoter_attendance');
    let myAtt = allAtt.filter(a => a.uid === currentUser.uid)
                      .sort((a,b) => new Date(b.date) - new Date(a.date))
                      .slice(0, 10);
    
    myAtt.forEach(d => {
        let s1 = d.slot1 ? '✅' : '❌';
        let s2 = d.slot2 ? '✅' : '❌';
        tb.innerHTML += `<tr><td>${d.date}</td><td>${s1}</td><td>${s2}</td></tr>`;
        
        // Update buttons if today
        if(d.date === today) {
            if(d.slot1) { $('btnAtt1').disabled = true; $('btnAtt1').innerText = 'تم تسجيل الفترة 1'; $('btnAtt1').style.background = 'var(--gn)'; }
            if(d.slot2) { $('btnAtt2').disabled = true; $('btnAtt2').innerText = 'تم تسجيل الفترة 2'; $('btnAtt2').style.background = 'var(--gn)'; }
        }
    });
}

// --- Admin Controls ---
function exportAdminExcel() {
    toast('هذه الميزة تتطلب مكتبة SheetJS. سيتم إضافتها قريباً.', 'info');
}

function clearLocalData() {
    if(confirm('هل أنت متأكد من مسح كافة البيانات المحفوظة؟ (هذا الإجراء لا يمكن التراجع عنه)')) {
        localStorage.clear();
        toast('تم مسح البيانات', 'success');
        logout();
    }
}
