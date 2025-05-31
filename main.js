const games = [];

let cart = [];

// إضافة ميزة حفظ السلة في localStorage
if (localStorage.getItem('apqrino_cart')) {
  cart = JSON.parse(localStorage.getItem('apqrino_cart'));
  updateCartCount();
}

function saveCart() {
  localStorage.setItem('apqrino_cart', JSON.stringify(cart));
}

// تحديث الدوال لحفظ السلة تلقائياً
function updateCartCount() {
  document.getElementById('cart-count').textContent = cart.length;
  saveCart();
}

function renderCart() {
  let cartSection = document.getElementById('checkout-section');
  let cartList = document.getElementById('cart-list');
  if (!cartList) {
    cartList = document.createElement('div');
    cartList.id = 'cart-list';
    cartSection.insertBefore(cartList, cartSection.firstChild);
  }
  if (cart.length === 0) {
    cartList.innerHTML = '<p>سلة المشتريات فارغة.</p>';
    document.getElementById('checkout-section').style.display = 'none';
    saveCart();
    return;
  }
  let html = '<ul style="list-style:none;padding:0;">';
  let total = 0;
  cart.forEach((item, i) => {
    let price = parseFloat(item.price.replace(/[^\d.]/g, '')) || 0;
    if (!isNaN(price)) total += price;
    html += `<li style="margin-bottom:8px;">${item.name} - ${item.price} <button data-remove="${i}" style="margin-right:8px; background:#e63946; color:#fff; border:none; border-radius:4px; cursor:pointer;">حذف</button></li>`;
  });
  html += '</ul>';
  html += `<div style="margin-top:10px;font-weight:bold;">الإجمالي: ${total ? total + ' ريال عماني' : 'مجاني'}</div>`;
  cartList.innerHTML = html;
  cartList.querySelectorAll('button[data-remove]').forEach(btn => {
    btn.onclick = function() {
      const idx = parseInt(this.getAttribute('data-remove'));
      cart.splice(idx, 1);
      updateCartCount();
      renderCart();
    };
  });
  saveCart();
}

// تحسين البحث ليكون غير حساس لحالة الأحرف ويبحث في كل الحقول
function normalize(str) {
  return str.toLowerCase().replace(/\s+/g, '');
}
document.getElementById('search').addEventListener('input', function(e) {
  const value = normalize(e.target.value.trim());
  const filtered = games.filter(game => normalize(game.name).includes(value) || normalize(game.desc).includes(value));
  renderGames(filtered);
});

// شريط مميز أعلى الصفحة
const topBanner = document.createElement('div');
topBanner.id = 'top-banner';
topBanner.innerHTML = '🔥 عروض خاصة اليوم فقط! شحن جواهر فري فاير وتخفيضات على جميع الألعاب. أسرع بالشراء!';
document.body.insertBefore(topBanner, document.body.firstChild);

// إشعارات منبثقة عصرية
function showToast(msg) {
  let toast = document.createElement('div');
  toast.id = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(()=>{ toast.remove(); }, 2000);
}

// إضافة رسالة عند إضافة منتج للسلة
function showToast(msg) {
  let toast = document.createElement('div');
  toast.textContent = msg;
  toast.style.position = 'fixed';
  toast.style.bottom = '30px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.background = '#22223b';
  toast.style.color = '#fff';
  toast.style.padding = '1rem 2rem';
  toast.style.borderRadius = '8px';
  toast.style.zIndex = 9999;
  document.body.appendChild(toast);
  setTimeout(()=>{ toast.remove(); }, 1800);
}

// تحديث زر الإضافة للسلة ليمنع التكرار
function renderGames(list) {
  const gamesList = document.getElementById('games-list');
  gamesList.innerHTML = '';
  list.forEach((game, idx) => {
    const card = document.createElement('div');
    card.className = 'game-card';
    if (game.featured) card.style.border = '2px solid #f4a261';
    let content = `
      <img src="${game.image}" alt="${game.name}" />
      <h2>${game.name}</h2>
      <p>${game.desc}</p>
    `;
    if (game.offer) {
      content += `<div style="color:#e63946;font-weight:bold;">${game.offer}</div>`;
    }
    if (game.oldPrice) {
      content += `<div><del style="color:#888;">${game.oldPrice}</del> <span style="color:#22223b;font-weight:bold;">${game.price}</span></div>`;
    } else {
      content += `<strong>${game.price}</strong>`;
    }
    // عرض التقييمات
    if (game.reviews && game.reviews.length) {
      content += '<div style="margin-top:10px;text-align:right;">';
      game.reviews.slice(-3).reverse().forEach(r => {
        content += `<div style=\"background:#f7f7f7;padding:6px 10px;border-radius:6px;margin-bottom:4px;\"><span style=\"color:#f4a261;font-weight:bold;\">${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)}</span> <span style=\"color:#222;\">${r.text}</span> <span style=\"color:#888;font-size:0.9em;\">- ${r.user}</span></div>`;
      });
      content += '</div>';
    }
    if (game.gems) {
      content += '<div style="margin:10px 0;">';
      game.gems.forEach((pkg, i) => {
        content += `<div style="margin-bottom:6px;">
          <strong>${pkg.amount} جواهر</strong> - <span>${pkg.price || (pkg.usd + ' USD')}</span>
          <button class="add-gems-to-cart" data-idx="${idx}" data-gem="${i}" style="margin-right:8px; background:#4a4e69; color:#fff; border:none; border-radius:6px; cursor:pointer; padding:0.3rem 0.8rem;">أضف للسلة</button>
        </div>`;
      });
      content += '</div>';
    } else {
      content += `<button class="add-to-cart" data-idx="${idx}" style="margin-top:8px; padding:0.5rem 1rem; background:#4a4e69; color:#fff; border:none; border-radius:6px; cursor:pointer;">أضف للسلة</button>`;
    }
    card.innerHTML = content;
    gamesList.appendChild(card);
  });
  // إضافة باقات الجواهر للسلة
  document.querySelectorAll('.add-gems-to-cart').forEach(btn => {
    btn.addEventListener('click', function() {
      const idx = this.getAttribute('data-idx');
      const gemIdx = this.getAttribute('data-gem');
      const game = games[idx];
      const pkg = game.gems[gemIdx];
      const itemName = `${game.name} (${pkg.amount} جواهر)`;
      if (cart.find(item => item.name === itemName)) {
        showToast('هذه الباقة موجودة بالفعل في السلة');
        return;
      }
      cart.push({
        name: itemName,
        image: game.image,
        price: pkg.price,
        desc: game.desc
      });
      updateCartCount();
      renderCart();
      document.getElementById('checkout-section').style.display = cart.length ? 'block' : 'none';
      showToast('تمت إضافة الباقة للسلة');
    });
  });
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', function() {
      const idx = this.getAttribute('data-idx');
      if (cart.find(item => item.name === games[idx].name)) {
        showToast('هذه اللعبة موجودة بالفعل في السلة');
        return;
      }
      cart.push(games[idx]);
      updateCartCount();
      renderCart();
      document.getElementById('checkout-section').style.display = cart.length ? 'block' : 'none';
      showToast('تمت إضافة اللعبة للسلة');
    });
  });
}

// تحسين عرض السلة
function renderCart() {
  let cartSection = document.getElementById('checkout-section');
  let cartList = document.getElementById('cart-list');
  if (!cartList) {
    cartList = document.createElement('div');
    cartList.id = 'cart-list';
    cartSection.insertBefore(cartList, cartSection.firstChild);
  }
  if (cart.length === 0) {
    cartList.innerHTML = '<p>سلة المشتريات فارغة.</p>';
    document.getElementById('checkout-section').style.display = 'none';
    saveCart();
    return;
  }
  let html = '<ul style="list-style:none;padding:0;">';
  let total = 0;
  cart.forEach((item, i) => {
    let price = parseFloat(item.price.replace(/[^\d.]/g, '')) || 0;
    if (!isNaN(price)) total += price;
    html += `<li style="margin-bottom:8px;">${item.name} - ${item.price} <button data-remove="${i}" style="margin-right:8px; background:#e63946; color:#fff; border:none; border-radius:4px; cursor:pointer;">حذف</button></li>`;
  });
  html += '</ul>';
  html += `<div style="margin-top:10px;font-weight:bold;">الإجمالي: ${total ? total + ' ريال عماني' : 'مجاني'}</div>`;
  cartList.innerHTML = html;
  cartList.querySelectorAll('button[data-remove]').forEach(btn => {
    btn.onclick = function() {
      const idx = parseInt(this.getAttribute('data-remove'));
      cart.splice(idx, 1);
      updateCartCount();
      renderCart();
    };
  });
  saveCart();
}

// تحديث سعر باقات فري فاير تلقائياً حسب سعر الدولار
async function updateFreeFireGemsPrices() {
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await res.json();
    const usdToSDG = data.rates.SDG;
    const ff = games.find(g => g.name.includes('فري فاير'));
    if (ff && ff.gems) {
      ff.gems.forEach(pkg => {
        pkg.price = Math.round(pkg.usd * usdToSDG) + ' جنيه سوداني';
      });
      renderGames(games);
      renderCart();
    }
  } catch (e) {}
}
updateFreeFireGemsPrices();

// Stripe integration (test mode)
document.getElementById('checkout-btn').addEventListener('click', async function() {
  if (cart.length === 0) return;
  document.getElementById('payment-message').textContent = 'جاري تحويلك لبوابة الدفع...';
  // في التطبيق الحقيقي يجب استدعاء backend لإنشاء جلسة دفع Stripe
  // هنا سنوجه المستخدم لصفحة دفع تجريبية
  window.open('https://buy.stripe.com/test_00g7uQ2wA2wQ0yQeUU', '_blank');
  setTimeout(()=>{
    document.getElementById('payment-message').textContent = 'تم إرسال الطلب لبوابة الدفع.';
  }, 2000);
});

// ========== واجهة تسجيل الدخول وإنشاء الحساب ========== //
function showAuthSection(show) {
  document.getElementById('auth-section').style.display = show ? 'block' : 'none';
  document.getElementById('games-list').style.display = show ? 'none' : 'grid';
  document.getElementById('checkout-section').style.display = show ? 'none' : (cart.length ? 'block' : 'none');
}

// عرض واجهة تسجيل الدخول عند أول زيارة إذا لم يكن المستخدم مسجلاً
if (!localStorage.getItem('apqrino_user')) {
  showAuthSection(true);
} else {
  showAuthSection(false);
}

document.getElementById('show-login').onclick = function() {
  document.getElementById('login-form').style.display = 'flex';
  document.getElementById('register-form').style.display = 'none';
  document.getElementById('auth-message').textContent = '';
};
document.getElementById('show-register').onclick = function() {
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('register-form').style.display = 'flex';
  document.getElementById('auth-message').textContent = '';
};
// افتراضيًا عرض التسجيل
if (document.getElementById('register-form')) {
  document.getElementById('register-form').style.display = 'flex';
}

// تسجيل حساب جديد (محلي فقط)
document.getElementById('register-form').onsubmit = function(e) {
  e.preventDefault();
  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;
  if (!name || !email || !password) return;
  localStorage.setItem('apqrino_user', JSON.stringify({name, email, password}));
  document.getElementById('auth-message').textContent = 'تم إنشاء الحساب بنجاح!';
  setTimeout(()=>{ showAuthSection(false); }, 1200);
};
// تسجيل الدخول (محلي فقط)
document.getElementById('login-form').onsubmit = function(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const user = JSON.parse(localStorage.getItem('apqrino_user') || '{}');
  if (user.email === email && user.password === password) {
    document.getElementById('auth-message').textContent = 'تم تسجيل الدخول بنجاح!';
    setTimeout(()=>{ showAuthSection(false); }, 1000);
  } else {
    document.getElementById('auth-message').textContent = 'بيانات الدخول غير صحيحة';
  }
};
// زر تسجيل الخروج
const logoutBtn = document.createElement('button');
logoutBtn.textContent = 'تسجيل الخروج';
logoutBtn.style = 'margin:0 1rem;background:#e63946;color:#fff;border:none;border-radius:6px;padding:0.5rem;cursor:pointer;';
logoutBtn.onclick = function() {
  localStorage.removeItem('apqrino_user');
  showAuthSection(true);
};
document.querySelector('nav').appendChild(logoutBtn);
// إخفاء زر تسجيل الخروج إذا لم يكن المستخدم مسجلاً
if (!localStorage.getItem('apqrino_user')) logoutBtn.style.display = 'none';
else logoutBtn.style.display = 'inline-block';
// إظهار/إخفاء زر تسجيل الخروج عند تغيير حالة الدخول
function updateLogoutBtn() {
  if (!localStorage.getItem('apqrino_user')) logoutBtn.style.display = 'none';
  else logoutBtn.style.display = 'inline-block';
}
// تحديث الزر عند تسجيل الدخول/الخروج
['register-form','login-form'].forEach(id=>{
  document.getElementById(id).addEventListener('submit',()=>setTimeout(updateLogoutBtn,1200));
});
logoutBtn.addEventListener('click',updateLogoutBtn);
// ===== ملف شخصي =====
function showProfile() {
  const user = JSON.parse(localStorage.getItem('apqrino_user') || '{}');
  if (!user.name) return;
  document.getElementById('profile-section').style.display = 'block';
  document.getElementById('games-list').style.display = 'none';
  document.getElementById('checkout-section').style.display = 'none';
  document.getElementById('profile-info').innerHTML = `
    <div><strong>الاسم:</strong> ${user.name}</div>
    <div><strong>البريد الإلكتروني:</strong> ${user.email}</div>
  `;
  document.getElementById('profile-name').value = user.name;
  document.getElementById('profile-email').value = user.email;
  document.getElementById('edit-profile-form').style.display = 'none';
  document.getElementById('profile-message').textContent = '';
}

// زر إظهار الملف الشخصي في القائمة
const profileBtn = document.createElement('button');
profileBtn.textContent = 'الملف الشخصي';
profileBtn.style = 'margin:0 1rem;background:#9a8c98;color:#fff;border:none;border-radius:6px;padding:0.5rem;cursor:pointer;';
profileBtn.onclick = showProfile;
document.querySelector('nav').appendChild(profileBtn);

// زر تعديل البيانات
if (document.getElementById('edit-profile-btn')) {
  document.getElementById('edit-profile-btn').onclick = function() {
    document.getElementById('edit-profile-form').style.display = 'flex';
    document.getElementById('profile-message').textContent = '';
  };
}
// حفظ التعديلات
if (document.getElementById('edit-profile-form')) {
  document.getElementById('edit-profile-form').onsubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('profile-name').value.trim();
    const email = document.getElementById('profile-email').value.trim();
    if (!name || !email) return;
    const user = JSON.parse(localStorage.getItem('apqrino_user') || '{}');
    user.name = name;
    user.email = email;
    localStorage.setItem('apqrino_user', JSON.stringify(user));
    document.getElementById('profile-message').textContent = 'تم حفظ التعديلات بنجاح';
    setTimeout(showProfile, 800);
  };
}
// إخفاء الملف الشخصي عند تسجيل الخروج
logoutBtn.addEventListener('click', function() {
  document.getElementById('profile-section').style.display = 'none';
  document.getElementById('games-list').style.display = 'grid';
});

// ========== صلاحيات المالك ========== //
function isOwner() {
  const user = JSON.parse(localStorage.getItem('apqrino_user') || '{}');
  // عدل البريد أدناه ليكون بريد المالك الحقيقي
  return user.email === 'owner@apqrino.com';
}

function showOwnerPanel() {
  if (!isOwner()) return;
  let panel = document.getElementById('owner-panel');
  if (!panel) {
    panel = document.createElement('section');
    panel.id = 'owner-panel';
    panel.style = 'background:#f1faee;padding:1rem;margin:2rem 0;border-radius:10px;max-width:600px;margin-left:auto;margin-right:auto;';
    panel.innerHTML = `
      <h3 style=\"color:#22223b;\">لوحة تحكم المالك</h3>
      <h4>إضافة لعبة جديدة</h4>
      <input id=\"new-game-name\" placeholder=\"اسم اللعبة\" style=\"margin-bottom:4px;padding:0.3rem;width:180px;\" />
      <input id=\"new-game-img\" placeholder=\"رابط صورة اللعبة\" style=\"margin-bottom:4px;padding:0.3rem;width:180px;\" />
      <input id=\"new-game-price\" placeholder=\"السعر (جنيه سوداني)\" type=\"number\" style=\"margin-bottom:4px;padding:0.3rem;width:120px;\" />
      <input id=\"new-game-desc\" placeholder=\"وصف مختصر\" style=\"margin-bottom:4px;padding:0.3rem;width:220px;\" />
      <button id=\"add-game-btn\" style=\"background:#4a4e69;color:#fff;padding:0.3rem 1rem;border:none;border-radius:6px;\">إضافة</button>
      <div id=\"add-game-message\" style=\"color:green;margin-top:8px;\"></div>
    `;
    document.body.insertBefore(panel, document.querySelector('footer'));
  }
  document.getElementById('add-game-btn').onclick = function() {
    const name = document.getElementById('new-game-name').value.trim();
    const image = document.getElementById('new-game-img').value.trim();
    const price = document.getElementById('new-game-price').value.trim();
    const desc = document.getElementById('new-game-desc').value.trim();
    if (!name || !image || !price || !desc) return;
    games.push({ name, image, price: price + ' جنيه سوداني', desc });
    renderGames(games);
    renderCart();
    showOwnerPanel();
    document.getElementById('add-game-message').textContent = 'تمت إضافة اللعبة بنجاح';
  };
}

if (localStorage.getItem('apqrino_user')) setTimeout(showOwnerPanel, 1000);

// ميزة الشراء الأوتوماتيكي (تأكيد الطلب مباشرة بعد الدفع)
function autoPurchase(method) {
  // بعد الدفع الناجح (مثال: بعد العودة من بوابة الدفع)
  if (localStorage.getItem('apqrino_cart') && cart.length > 0) {
    // حفظ الطلبات في سجل المستخدم
    let user = JSON.parse(localStorage.getItem('apqrino_user') || '{}');
    if (!user.orders) user.orders = [];
    const address = JSON.parse(localStorage.getItem('apqrino_address') || '{}');
    user.orders.push({
      items: [...cart],
      date: new Date().toLocaleString('ar-EG'),
      status: method === 'cod' ? 'بانتظار الدفع عند الاستلام' : 'قيد التنفيذ',
      address,
      payment: method === 'cod' ? 'الدفع عند الاستلام' : 'بطاقة إلكترونية'
    });
    localStorage.setItem('apqrino_user', JSON.stringify(user));
    // إفراغ السلة
    cart = [];
    updateCartCount();
    renderCart();
    showToast(method === 'cod' ? 'تم تسجيل الطلب، سيتم التواصل معك للدفع عند الاستلام.' : 'تم الشراء بنجاح! الطلب قيد التنفيذ.');
  }
}
// استدعاء autoPurchase بعد الدفع (محاكاة)
document.getElementById('checkout-btn').addEventListener('click', function() {
  setTimeout(autoPurchase, 4000); // محاكاة نجاح الدفع بعد 4 ثوانٍ
});
// عرض سجل الطلبات في الملف الشخصي
if (document.getElementById('profile-info')) {
  const user = JSON.parse(localStorage.getItem('apqrino_user') || '{}');
  if (user.orders && user.orders.length) {
    let ordersHtml = '<h3 style="color:#4a4e69;">سجل الطلبات</h3>';
    user.orders.slice(-5).reverse().forEach(order => {
      ordersHtml += `<div style=\"background:#f7f7f7;padding:8px 12px;border-radius:8px;margin-bottom:8px;\">${order.date} - <span style=\"color:green;\">${order.status}</span> <span style=\"color:#f4a261;\">(${order.payment||''})</span><ul style=\"margin:0;padding-right:18px;\">`;
      order.items.forEach(it => {
        ordersHtml += `<li>${it.name} (${it.price})</li>`;
      });
      ordersHtml += '</ul>';
      if(order.address && order.address.name) {
        ordersHtml += `<div style=\"color:#4a4e69;font-size:0.95em;\">${order.address.name}, ${order.address.city}, ${order.address.details}, ${order.address.phone}</div>`;
      }
      ordersHtml += '</div>';
    });
    document.getElementById('profile-info').innerHTML += ordersHtml;
  }
}

// ========== ميزات الشراء العالمية ========== //
// 1. اختيار عنوان التوصيل
function showAddressModal() {
  let modal = document.getElementById('address-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'address-modal';
    modal.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:#0008;z-index:9999;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
      <div style="background:#fff;padding:2rem 1.5rem;border-radius:16px;min-width:320px;max-width:90vw;box-shadow:0 2px 16px #22223b44;">
        <h3 style="color:#4a4e69;">بيانات التوصيل</h3>
        <form id="address-form" style="display:flex;flex-direction:column;gap:1rem;">
          <input id="address-name" placeholder="الاسم الكامل" required style="padding:0.5rem;" />
          <input id="address-phone" placeholder="رقم الجوال" required style="padding:0.5rem;" />
          <input id="address-city" placeholder="المدينة" required style="padding:0.5rem;" />
          <input id="address-details" placeholder="العنوان التفصيلي" required style="padding:0.5rem;" />
          <button type="submit" style="background:#4a4e69;color:#fff;padding:0.5rem 1.2rem;border:none;border-radius:8px;">حفظ العنوان</button>
        </form>
        <button id="close-address-modal" style="margin-top:1rem;background:#e63946;color:#fff;padding:0.3rem 1rem;border:none;border-radius:6px;">إغلاق</button>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('close-address-modal').onclick = function() {
      modal.remove();
    };
    document.getElementById('address-form').onsubmit = function(e) {
      e.preventDefault();
      const name = document.getElementById('address-name').value.trim();
      const phone = document.getElementById('address-phone').value.trim();
      const city = document.getElementById('address-city').value.trim();
      const details = document.getElementById('address-details').value.trim();
      if (!name || !phone || !city || !details) return;
      localStorage.setItem('apqrino_address', JSON.stringify({name, phone, city, details}));
      showToast('تم حفظ العنوان بنجاح');
      setTimeout(()=>modal.remove(), 1000);
    };
  }
}
// زر اختيار العنوان قبل الدفع
const addressBtn = document.createElement('button');
addressBtn.textContent = 'إدخال/تعديل عنوان التوصيل';
addressBtn.style = 'margin:0 1rem;background:#9a8c98;color:#fff;border:none;border-radius:6px;padding:0.5rem;cursor:pointer;';
addressBtn.onclick = showAddressModal;
document.getElementById('checkout-section').insertBefore(addressBtn, document.getElementById('checkout-btn'));

// 2. ملخص الطلب قبل الدفع
function showOrderSummary() {
  let summary = 'ملخص الطلب:\n';
  cart.forEach(item => {
    summary += `- ${item.name} (${item.price})\n`;
  });
  const address = JSON.parse(localStorage.getItem('apqrino_address') || '{}');
  if (address.name) {
    summary += `\nالتوصيل إلى: ${address.name}, ${address.city}, ${address.details}, ${address.phone}`;
  }
  alert(summary);
}
document.getElementById('checkout-btn').addEventListener('click', showOrderSummary);

// 3. تتبع حالة الطلب (في الملف الشخصي)
// تحديث سجل الطلبات ليشمل حالة الطلب
function autoPurchase() {
  if (localStorage.getItem('apqrino_cart') && cart.length > 0) {
    let user = JSON.parse(localStorage.getItem('apqrino_user') || '{}');
    if (!user.orders) user.orders = [];
    const address = JSON.parse(localStorage.getItem('apqrino_address') || '{}');
    user.orders.push({
      items: [...cart],
      date: new Date().toLocaleString('ar-EG'),
      status: 'قيد التنفيذ',
      address
    });
    localStorage.setItem('apqrino_user', JSON.stringify(user));
    cart = [];
    updateCartCount();
    renderCart();
    showToast('تم الشراء بنجاح! الطلب قيد التنفيذ.');
  }
}
// تحديث عرض سجل الطلبات ليشمل العنوان وحالة الطلب
if (document.getElementById('profile-info')) {
  const user = JSON.parse(localStorage.getItem('apqrino_user') || '{}');
  if (user.orders && user.orders.length) {
    let ordersHtml = '<h3 style="color:#4a4e69;">سجل الطلبات</h3>';
    user.orders.slice(-5).reverse().forEach(order => {
      ordersHtml += `<div style=\"background:#f7f7f7;padding:8px 12px;border-radius:8px;margin-bottom:8px;\">${order.date} - <span style=\"color:green;\">${order.status}</span> <span style=\"color:#f4a261;\">(${order.payment||''})</span><ul style=\"margin:0;padding-right:18px;\">`;
      order.items.forEach(it => {
        ordersHtml += `<li>${it.name} (${it.price})</li>`;
      });
      ordersHtml += '</ul>';
      if(order.address && order.address.name) {
        ordersHtml += `<div style=\"color:#4a4e69;font-size:0.95em;\">${order.address.name}, ${order.address.city}, ${order.address.details}, ${order.address.phone}</div>`;
      }
      ordersHtml += '</div>';
    });
    document.getElementById('profile-info').innerHTML += ordersHtml;
  }
}

// 4. اختيار طريقة الدفع (بطاقة/دفع عند الاستلام)
function showPaymentMethodModal() {
  let modal = document.getElementById('payment-method-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'payment-method-modal';
    modal.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:#0008;z-index:9999;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
      <div style="background:#fff;padding:2rem 1.5rem;border-radius:16px;min-width:320px;max-width:90vw;box-shadow:0 2px 16px #22223b44;">
        <h3 style="color:#4a4e69;">اختر طريقة الدفع</h3>
        <button id="pay-card" style="background:#4a4e69;color:#fff;padding:0.7rem 1.5rem;border:none;border-radius:8px;margin-bottom:1rem;width:100%;font-size:1.1rem;">بطاقة فيزا/ماستركارد</button>
        <button id="pay-cod" style="background:#f4a261;color:#fff;padding:0.7rem 1.5rem;border:none;border-radius:8px;width:100%;font-size:1.1rem;">الدفع عند الاستلام</button>
        <button id="close-payment-method-modal" style="margin-top:1rem;background:#e63946;color:#fff;padding:0.3rem 1rem;border:none;border-radius:6px;">إغلاق</button>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('close-payment-method-modal').onclick = function() {
      modal.remove();
    };
    document.getElementById('pay-card').onclick = function() {
      modal.remove();
      // تابع الدفع الإلكتروني
      document.getElementById('payment-message').textContent = 'سيتم تحويلك لبوابة الدفع الآمنة.';
      window.open('https://buy.stripe.com/test_00g7uQ2wA2wQ0yQeUU', '_blank');
      setTimeout(autoPurchase, 4000); // محاكاة نجاح الدفع بعد 4 ثوانٍ
    };
    document.getElementById('pay-cod').onclick = function() {
      modal.remove();
      // تابع الدفع عند الاستلام
      autoPurchase('cod');
    };
  }
}
// تعديل زر الدفع ليعرض اختيار طريقة الدفع
const checkoutBtn = document.getElementById('checkout-btn');
if (checkoutBtn) {
  checkoutBtn.onclick = function(e) {
    e.preventDefault();
    showOrderSummary();
    showPaymentMethodModal();
  };
}
