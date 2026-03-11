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
  let cartItemsHtml = '<ul style="list-style:none;padding:0;">';
  let cartTotalPrice = 0;
  cart.forEach((item, cartItemIndex) => {
    let itemPrice = parseFloat(item.price.replace(/[^\d.]/g, '')) || 0;
    if (!isNaN(itemPrice)) cartTotalPrice += itemPrice;
    cartItemsHtml += `<li style="margin-bottom:8px;">${item.name} - ${item.price} <button data-remove="${cartItemIndex}" style="margin-right:8px; background:#e63946; color:#fff; border:none; border-radius:4px; cursor:pointer;">حذف</button></li>`;
  });
  cartItemsHtml += '</ul>';
  cartItemsHtml += `<div style="margin-top:10px;font-weight:bold;">الإجمالي: ${cartTotalPrice ? cartTotalPrice + ' ريال عماني' : 'مجاني'}</div>`;
  cartList.innerHTML = cartItemsHtml;
  cartList.querySelectorAll('button[data-remove]').forEach(btn => {
    btn.onclick = function() {
      const cartItemIndex = parseInt(this.getAttribute('data-remove'));
      cart.splice(cartItemIndex, 1);
      updateCartCount();
      renderCart();
    };
  });
  saveCart();
}

// تحسين البحث ليكون غير حساس لحالة الأحرف ويبحث في كل الحقول
function normalizeSearchText(str) {
  return str.toLowerCase().replace(/\s+/g, '');
}
document.getElementById('search').addEventListener('input', function(e) {
  const value = normalizeSearchText(e.target.value.trim());
  const filtered = games.filter(game => normalizeSearchText(game.name).includes(value) || normalizeSearchText(game.desc).includes(value));
  renderGames(filtered);
});

// شريط مميز أعلى الصفحة
const topBanner = document.createElement('div');
topBanner.id = 'top-banner';
topBanner.innerHTML = '🔥 عروض خاصة اليوم فقط! شحن جواهر فري فاير وتخفيضات على جميع الألعاب. أسرع بالشراء!';
document.body.insertBefore(topBanner, document.body.firstChild);

// إشعارات منبثقة عصرية
function showToast(message) {
  let toast = document.createElement('div');
  toast.id = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(()=>{ toast.remove(); }, 2000);
}

// إضافة رسالة عند إضافة منتج للسلة
function showToast(message) {
  let toast = document.createElement('div');
  toast.textContent = message;
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
function renderGames(filteredGames) {
  const gamesList = document.getElementById('games-list');
  gamesList.innerHTML = '';
  filteredGames.forEach((game, gameIndex) => {
    const card = document.createElement('div');
    card.className = 'game-card';
    if (game.featured) card.style.border = '2px solid #f4a261';
    let gameCardHtml = `
      <img src="${game.image}" alt="${game.name}" />
      <h2>${game.name}</h2>
      <p>${game.desc}</p>
    `;
    if (game.offer) {
      gameCardHtml += `<div style="color:#e63946;font-weight:bold;">${game.offer}</div>`;
    }
    if (game.oldPrice) {
      gameCardHtml += `<div><del style="color:#888;">${game.oldPrice}</del> <span style="color:#22223b;font-weight:bold;">${game.price}</span></div>`;
    } else {
      gameCardHtml += `<strong>${game.price}</strong>`;
    }
    // عرض التقييمات
    if (game.reviews && game.reviews.length) {
      gameCardHtml += '<div style="margin-top:10px;text-align:right;">';
      game.reviews.slice(-3).reverse().forEach(review => {
        gameCardHtml += `<div style=\"background:#f7f7f7;padding:6px 10px;border-radius:6px;margin-bottom:4px;\"><span style=\"color:#f4a261;font-weight:bold;\">${'★'.repeat(review.stars)}${'☆'.repeat(5-review.stars)}</span> <span style=\"color:#222;\">${review.text}</span> <span style=\"color:#888;font-size:0.9em;\">- ${review.user}</span></div>`;
      });
      gameCardHtml += '</div>';
    }
    if (game.gems) {
      gameCardHtml += '<div style="margin:10px 0;">';
      game.gems.forEach((gemPackage, gemPackageIndex) => {
        gameCardHtml += `<div style="margin-bottom:6px;">
          <strong>${gemPackage.amount} جواهر</strong> - <span>${gemPackage.price || (gemPackage.usd + ' USD')}</span>
          <button class="add-gems-to-cart" data-idx="${gameIndex}" data-gem="${gemPackageIndex}" style="margin-right:8px; background:#4a4e69; color:#fff; border:none; border-radius:6px; cursor:pointer; padding:0.3rem 0.8rem;">أضف للسلة</button>
        </div>`;
      });
      gameCardHtml += '</div>';
    } else {
      gameCardHtml += `<button class="add-to-cart" data-idx="${gameIndex}" style="margin-top:8px; padding:0.5rem 1rem; background:#4a4e69; color:#fff; border:none; border-radius:6px; cursor:pointer;">أضف للسلة</button>`;
    }
    card.innerHTML = gameCardHtml;
    gamesList.appendChild(card);
  });
  // إضافة باقات الجواهر للسلة
  document.querySelectorAll('.add-gems-to-cart').forEach(btn => {
    btn.addEventListener('click', function() {
      const gameIndex = this.getAttribute('data-idx');
      const gemPackageIndex = this.getAttribute('data-gem');
      const game = games[gameIndex];
      const gemPackage = game.gems[gemPackageIndex];
      const itemName = `${game.name} (${gemPackage.amount} جواهر)`;
      if (cart.find(item => item.name === itemName)) {
        showToast('هذه الباقة موجودة بالفعل في السلة');
        return;
      }
      cart.push({
        name: itemName,
        image: game.image,
        price: gemPackage.price,
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
      const gameIndex = this.getAttribute('data-idx');
      if (cart.find(item => item.name === games[gameIndex].name)) {
        showToast('هذه اللعبة موجودة بالفعل في السلة');
        return;
      }
      cart.push(games[gameIndex]);
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
  let cartItemsHtml = '<ul style="list-style:none;padding:0;">';
  let cartTotalPrice = 0;
  cart.forEach((item, cartItemIndex) => {
    let itemPrice = parseFloat(item.price.replace(/[^\d.]/g, '')) || 0;
    if (!isNaN(itemPrice)) cartTotalPrice += itemPrice;
    cartItemsHtml += `<li style="margin-bottom:8px;">${item.name} - ${item.price} <button data-remove="${cartItemIndex}" style="margin-right:8px; background:#e63946; color:#fff; border:none; border-radius:4px; cursor:pointer;">حذف</button></li>`;
  });
  cartItemsHtml += '</ul>';
  cartItemsHtml += `<div style="margin-top:10px;font-weight:bold;">الإجمالي: ${cartTotalPrice ? cartTotalPrice + ' ريال عماني' : 'مجاني'}</div>`;
  cartList.innerHTML = cartItemsHtml;
  cartList.querySelectorAll('button[data-remove]').forEach(btn => {
    btn.onclick = function() {
      const cartItemIndex = parseInt(this.getAttribute('data-remove'));
      cart.splice(cartItemIndex, 1);
      updateCartCount();
      renderCart();
    };
  });
  saveCart();
}

// تحديث سعر باقات فري فاير تلقائياً حسب سعر الدولار
async function updateFreeFireGemsPrices() {
  try {
    const fetchResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const exchangeRateData = await fetchResponse.json();
    const usdToSDG = exchangeRateData.rates.SDG;
    const freefireGame = games.find(g => g.name.includes('فري فاير'));
    if (freefireGame && freefireGame.gems) {
      freefireGame.gems.forEach(gemPackage => {
        gemPackage.price = Math.round(gemPackage.usd * usdToSDG) + ' جنيه سوداني';
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
function showAuthSection(shouldShow) {
  document.getElementById('auth-section').style.display = shouldShow ? 'block' : 'none';
  document.getElementById('games-list').style.display = shouldShow ? 'none' : 'grid';
  document.getElementById('checkout-section').style.display = shouldShow ? 'none' : (cart.length ? 'block' : 'none');
}

// إضافة خيار "تذكرني" في نموذج تسجيل الدخول
const loginForm = document.getElementById('login-form');
if (loginForm && !document.getElementById('remember-me')) {
  const rememberDiv = document.createElement('div');
  rememberDiv.style = 'display:flex;align-items:center;gap:7px;';
  const rememberCheckbox = document.createElement('input');
  rememberCheckbox.type = 'checkbox';
  rememberCheckbox.id = 'remember-me';
  rememberCheckbox.style = 'width:18px;height:18px;';
  const rememberLabel = document.createElement('label');
  rememberLabel.htmlFor = 'remember-me';
  rememberLabel.textContent = 'حفظ الحساب';
  rememberLabel.style = 'font-size:1rem;color:#4a4e69;';
  rememberDiv.appendChild(rememberCheckbox);
  rememberDiv.appendChild(rememberLabel);
  loginForm.insertBefore(rememberDiv, loginForm.querySelector('button'));
}

// عند تسجيل الدخول، إذا تم اختيار "حفظ الحساب"، احفظ بيانات الدخول في localStorage
loginForm && loginForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const remember = document.getElementById('remember-me').checked;
  const user = JSON.parse(localStorage.getItem('apqrino_user') || '{}');
  if (user.email === email && user.password === password) {
    document.getElementById('auth-message').textContent = 'تم تسجيل الدخول بنجاح!';
    if (remember) {
      localStorage.setItem('apqrino_remember', JSON.stringify({ email, password }));
    } else {
      localStorage.removeItem('apqrino_remember');
    }
    setTimeout(()=>{ showAuthSection(false); }, 1000);
  } else {
    document.getElementById('auth-message').textContent = 'بيانات الدخول غير صحيحة';
  }
});

// عند تحميل الصفحة، إذا كان هناك بيانات محفوظة، املأ الحقول تلقائياً
window.addEventListener('DOMContentLoaded', function() {
  const remembered = JSON.parse(localStorage.getItem('apqrino_remember') || 'null');
  if (remembered) {
    document.getElementById('login-email').value = remembered.email;
    document.getElementById('login-password').value = remembered.password;
    document.getElementById('remember-me').checked = true;
  }
});

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
function completePurchaseAndSaveOrder(paymentMethod) {
  // بعد الدفع الناجح (مثال: بعد العودة من بوابة الدفع)
  if (localStorage.getItem('apqrino_cart') && cart.length > 0) {
    // حفظ الطلبات في سجل المستخدم
    let user = JSON.parse(localStorage.getItem('apqrino_user') || '{}');
    if (!user.orders) user.orders = [];
    const address = JSON.parse(localStorage.getItem('apqrino_address') || '{}');
    let paymentType = 'بطاقة إلكترونية';
    if (paymentMethod === 'mycashy') paymentType = 'ماي كاشي';
    user.orders.push({
      items: [...cart],
      date: new Date().toLocaleString('ar-EG'),
      status: 'قيد التنفيذ',
      address,
      payment: paymentType
    });
    localStorage.setItem('apqrino_user', JSON.stringify(user));
    // إفراغ السلة
    cart = [];
    updateCartCount();
    renderCart();
    let message = 'تم الشراء بنجاح! الطلب قيد التنفيذ.';
    if (paymentMethod === 'mycashy') message = 'تم تسجيل الطلب، سيتم مراجعته بعد الدفع عبر ماي كاشي.';
    showToast(message);
  }
}
// استدعاء completePurchaseAndSaveOrder بعد الدفع (محاكاة)
document.getElementById('checkout-btn').addEventListener('click', function() {
  setTimeout(completePurchaseAndSaveOrder, 4000); // محاكاة نجاح الدفع بعد 4 ثوانٍ
});
// عرض سجل الطلبات في الملف الشخصي
if (document.getElementById('profile-info')) {
  const user = JSON.parse(localStorage.getItem('apqrino_user') || '{}');
  if (user.orders && user.orders.length) {
    let ordersHtml = '<h3 style="color:#4a4e69;">سجل الطلبات</h3>';
    user.orders.slice(-5).reverse().forEach(order => {
      ordersHtml += `<div style=\"background:#f7f7f7;padding:8px 12px;border-radius:8px;margin-bottom:8px;\">${order.date} - <span style=\"color:green;\">${order.status}</span> <span style=\"color:#f4a261;\">(${order.payment||''})</span><ul style=\"margin:0;padding-right:18px;\">`;
      order.items.forEach(orderItem => {
        ordersHtml += `<li>${orderItem.name} (${orderItem.price})</li>`;
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
function completePurchaseAndSaveOrder() {
  if (localStorage.getItem('apqrino_cart') && cart.length > 0) {
    let user = JSON.parse(localStorage.getItem('apqrino_user') || '{}');
    if (!user.orders) user.orders = [];
    const address = JSON.parse(localStorage.getItem('apqrino_address') || '{}');
    user.orders.push({
      items: [...cart],
      date: new Date().toLocaleString('ar-EG'),
      status: 'قيد التنفيذ',
      address,
      payment: 'بطاقة إلكترونية'
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
      order.items.forEach(orderItem => {
        ordersHtml += `<li>${orderItem.name} (${orderItem.price})</li>`;
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
        <button id="pay-bankak" style="background:#2d6a4f;color:#fff;padding:0.7rem 1.5rem;border:none;border-radius:8px;margin-bottom:1rem;width:100%;font-size:1.1rem;">الدفع عبر بنكك</button>
        <button id="pay-mycashy" style="background:#f4a261;color:#fff;padding:0.7rem 1.5rem;border:none;border-radius:8px;margin-bottom:1rem;width:100%;font-size:1.1rem;">الدفع عبر ماي كاشي</button>
        <button id="close-payment-method-modal" style="margin-top:1rem;background:#e63946;color:#fff;padding:0.3rem 1rem;border:none;border-radius:6px;">إغلاق</button>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('close-payment-method-modal').onclick = function() {
      modal.remove();
    };
    document.getElementById('pay-card').onclick = function() {
      modal.remove();
      document.getElementById('payment-message').textContent = 'سيتم تحويلك لبوابة الدفع الآمنة.';
      window.open('https://buy.stripe.com/test_00g7uQ2wA2wQ0yQeUU', '_blank');
      setTimeout(completePurchaseAndSaveOrder, 4000); // محاكاة نجاح الدفع بعد 4 ثوانٍ
    };
    document.getElementById('pay-bankak').onclick = function() {
      modal.remove();
      document.getElementById('bankak-form').style.display = 'block';
      document.getElementById('bankak-message').textContent = '';
    };
    document.getElementById('pay-mycashy').onclick = function() {
      modal.remove();
      document.getElementById('payment-message').innerHTML = '<div style="color:#222;background:#fff3e0;padding:1rem 1.2rem;border-radius:10px;margin:1rem auto;max-width:350px;">يرجى الدفع عبر تطبيق <b>ماي كاشي</b> إلى رقم الحساب التالي:<br><span style="color:#f4a261;font-size:1.2rem;font-weight:bold;direction:ltr;">635901</span><br>ثم تأكيد العملية من خلال التواصل مع الدعم.</div>';
      setTimeout(function() {
        completePurchaseAndSaveOrder('mycashy');
      }, 4000); // محاكاة نجاح الدفع بعد 4 ثوانٍ
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

// إضافة منطق إظهار نموذج بنكك والتعامل مع بيانات التحويل
const bankakPaymentButton = document.getElementById('bankak-btn');
const bankakPaymentForm = document.getElementById('bankak-form');
const submitBankakPaymentButton = document.getElementById('submit-bankak');
const bankakPaymentMessage = document.getElementById('bankak-message');

if (bankakPaymentButton && bankakPaymentForm && submitBankakPaymentButton) {
  bankakPaymentButton.onclick = () => {
    bankakPaymentForm.style.display = bankakPaymentForm.style.display === 'none' ? 'block' : 'none';
  };
  submitBankakPaymentButton.onclick = (e) => {
    e.preventDefault();
    const transactionId = document.getElementById('bankak-txid').value.trim();
    const paymentProofFile = document.getElementById('bankak-proof').files[0];
    if (!transactionId) {
      bankakPaymentMessage.style.color = 'red';
      bankakPaymentMessage.textContent = 'يرجى إدخال رقم العملية البنكية.';
      return;
    }
    bankakPaymentMessage.style.color = 'green';
    bankakPaymentMessage.textContent = 'تم استلام بيانات التحويل. سيتم مراجعتها من الإدارة.';
    // هنا يمكنك حفظ بيانات التحويل في localStorage أو إرسالها للسيرفر لاحقاً
    document.getElementById('bankak-txid').value = '';
    document.getElementById('bankak-proof').value = '';
    setTimeout(() => { bankakPaymentForm.style.display = 'none'; bankakPaymentMessage.textContent = ''; }, 2500);
  };
}

// دعم تعدد العملات (جنيه سوداني و ريال عماني)
const currencyRates = { SDG: 1, OMR: 0.0007 };
let currentCurrency = localStorage.getItem('apqrino_currency') || 'SDG';
const currencySelect = document.getElementById('currency-select');
if (currencySelect) {
  currencySelect.value = currentCurrency;
  currencySelect.onchange = function() {
    currentCurrency = this.value;
    localStorage.setItem('apqrino_currency', currentCurrency);
    updateAllPrices();
  };
}
function updateAllPrices() {
  document.querySelectorAll('[data-price-sdg]').forEach(el => {
    const priceSDG = parseFloat(el.getAttribute('data-price-sdg'));
    let price = priceSDG;
    let symbol = 'ج.س';
    if (currentCurrency === 'OMR') {
      price = (priceSDG * currencyRates.OMR).toFixed(3);
      symbol = 'ر.ع';
    }
    el.textContent = price + ' ' + symbol;
  });
}

// بوت تحديث أسعار العملات تلقائياً من الإنترنت
async function updateCurrencyRates() {
  try {
    // مثال: استخدام API مجاني (exchangerate-api.com أو أي مصدر آخر)
    const fetchResponse = await fetch('https://api.exchangerate-api.com/v4/latest/SDG');
    const exchangeRateData = await fetchResponse.json();
    if (exchangeRateData && exchangeRateData.rates) {
      // تحديث سعر الريال العماني مقابل الجنيه السوداني
      currencyRates.OMR = exchangeRateData.rates.OMR || currencyRates.OMR;
      localStorage.setItem('apqrino_rates', JSON.stringify(currencyRates));
      updateAllPrices();
    }
  } catch (e) {
    // في حال فشل الجلب، استخدم السعر القديم
  }
}
// تحميل أسعار محفوظة عند بدء التشغيل
const savedCurrencyRates = localStorage.getItem('apqrino_rates');
if (savedCurrencyRates) {
  Object.assign(currencyRates, JSON.parse(savedCurrencyRates));
}
updateCurrencyRates();
setInterval(updateCurrencyRates, 1000 * 60 * 60 * 6); // يحدث كل 6 ساعات

// إظهار طبقة الإغلاق لمدة نصف ساعة ثم إخفاؤها، ثم إعادة إظهارها بعد نصف ساعة
(function() {
  const overlay = document.querySelector('body > div[style*="position:fixed"]');
  if (overlay) {
    overlay.style.display = 'flex';
    setTimeout(() => {
      overlay.style.display = 'none';
      setTimeout(() => {
        overlay.style.display = 'flex';
      }, 30 * 60 * 1000);
    }, 30 * 60 * 1000);
  }
})();

// ====== منطق شحن فري فاير ======
const ffForm = document.getElementById('ff-form');
if (ffForm) {
  ffForm.onsubmit = function(e) {
    e.preventDefault();
    const userId = document.getElementById('ff-userid').value.trim();
    const selectedPackageAmount = document.getElementById('ff-package').value;
    if (!userId) {
      document.getElementById('ff-message').style.color = 'red';
      document.getElementById('ff-message').textContent = 'يرجى إدخال معرف اللاعب.';
      return;
    }
    // أسعار الباقات حسب العملة
    const currency = document.getElementById('currency-select').value;
    const prices = {
      SDG: { '100': 1500, '210': 2900, '530': 6900, '1080': 12900, '2200': 24900 },
      OMR: { '100': 1.2, '210': 2.3, '530': 5.5, '1080': 10.5, '2200': 20 }
    };
    const price = prices[currency][selectedPackageAmount];
    // إضافة للسلة
    const cartItem = {
      id: 'ff-' + selectedPackageAmount,
      name: `فري فاير - ${selectedPackageAmount} جوهرة`,
      userId,
      price,
      currency,
      qty: 1,
      type: 'freefire'
    };
    let currentCart = JSON.parse(localStorage.getItem('apqrino_cart') || '[]');
    currentCart.push(cartItem);
    localStorage.setItem('apqrino_cart', JSON.stringify(currentCart));
    document.getElementById('ff-message').style.color = 'green';
    document.getElementById('ff-message').textContent = 'تمت إضافة الباقة للسلة بنجاح!';
    updateCartCount && updateCartCount();
    setTimeout(()=>{ document.getElementById('ff-message').textContent = ''; }, 2000);
    ffForm.reset();
  };
}
