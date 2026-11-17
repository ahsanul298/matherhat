/* ==========================================================
   মাঠের হাট – ফ্রন্টএন্ড ইন্টারঅ্যাকশন
   এখানকার ডেটা ডেমো। ব্যাকএন্ড যুক্ত হলে PRODUCTS অ্যারের জায়গায়
   Laravel API (যেমন /api/products) থেকে fetch() করে ডেটা আনবেন।
   ========================================================== */

(function () {
  'use strict';

  /* ---------- ডেমো ডেটা ---------- */
  // retail = ৳/কেজি, wholesale = ৳/মণ (১ মণ = ৪০ কেজি), minMon = পাইকারির ন্যূনতম মণ, stock = মণ
  var PRODUCTS = [
    { id: 1,  name: 'আলু (ডায়মন্ড)',   emoji: '🥔', cat: 'সবজি',     farmer: 'রহিম উদ্দিন',     district: 'মুন্সিগঞ্জ', retail: 38,  wholesale: 1400, minMon: 5, stock: 120 },
    { id: 2,  name: 'টমেটো',            emoji: '🍅', cat: 'সবজি',     farmer: 'সালমা খাতুন',     district: 'যশোর',      retail: 55,  wholesale: 1900, minMon: 3, stock: 40 },
    { id: 3,  name: 'বেগুন',            emoji: '🍆', cat: 'সবজি',     farmer: 'করিম মিয়া',      district: 'বগুড়া',    retail: 60,  wholesale: 2100, minMon: 3, stock: 25 },
    { id: 4,  name: 'বাঁধাকপি',         emoji: '🥬', cat: 'সবজি',     farmer: 'আনোয়ার হোসেন',   district: 'ময়মনসিংহ', retail: 30,  wholesale: 1100, minMon: 5, stock: 60 },
    { id: 5,  name: 'কাঁচা মরিচ',       emoji: '🌶️', cat: 'সবজি',     farmer: 'শিরিন আক্তার',    district: 'বগুড়া',    retail: 140, wholesale: 5200, minMon: 1, stock: 8 },
    { id: 6,  name: 'আম (হিমসাগর)',    emoji: '🥭', cat: 'ফল',       farmer: 'আব্দুল হালিম',    district: 'রাজশাহী',   retail: 120, wholesale: 4200, minMon: 2, stock: 30 },
    { id: 7,  name: 'কলা (সবরি)',       emoji: '🍌', cat: 'ফল',       farmer: 'জাহিদ হাসান',     district: 'নরসিংদী',   retail: 70,  wholesale: 2500, minMon: 2, stock: 18 },
    { id: 8,  name: 'মিনিকেট চাল',      emoji: '🍚', cat: 'ধান-চাল', farmer: 'নুরুল ইসলাম',     district: 'দিনাজপুর',  retail: 72,  wholesale: 2750, minMon: 5, stock: 200 },
    { id: 9,  name: 'মসুর ডাল',         emoji: '🫘', cat: 'ডাল-মসলা', farmer: 'ফারুক হোসেন',     district: 'পাবনা',     retail: 130, wholesale: 5000, minMon: 2, stock: 35 },
    { id: 10, name: 'দেশি পেঁয়াজ',     emoji: '🧅', cat: 'ডাল-মসলা', farmer: 'মনোয়ারা বেগম',    district: 'ফরিদপুর',   retail: 85,  wholesale: 3200, minMon: 5, stock: 90 },
    { id: 11, name: 'রুই মাছ (তাজা)',   emoji: '🐟', cat: 'মাছ',      farmer: 'শহিদুল ইসলাম',    district: 'যশোর',      retail: 280, wholesale: 10500, minMon: 1, stock: 6 }
  ];

  var CATEGORIES = ['সব', 'সবজি', 'ফল', 'ধান-চাল', 'ডাল-মসলা', 'মাছ'];
  var TILE_COLORS = { 'সবজি': '#e2efd6', 'ফল': '#fbeccb', 'ধান-চাল': '#efe6d2', 'ডাল-মসলা': '#f3dfd0', 'মাছ': '#d8e9ef' };
  var CAT_EMOJI = { 'সবজি': '🥬', 'ফল': '🍎', 'ধান-চাল': '🌾', 'ডাল-মসলা': '🫘', 'মাছ': '🐟' };

  var state = { mode: 'retail', cat: 'সব', q: '', sort: 'default' };
  var nextId = 100;

  /* ---------- ছোট সহায়ক ফাংশন ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function bn(n) { return Number(n).toLocaleString('bn-BD'); }
  function taka(n) { return '৳' + bn(Math.round(n)); }
  function activePrice(p) { return state.mode === 'retail' ? p.retail : p.wholesale; }

  var toastTimer;
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 2800);
  }

  /* ---------- দরের বোর্ড ---------- */
  function renderBoard() {
    var picks = [1, 2, 8, 9, 10];
    var rows = picks.map(function (id) {
      var p = PRODUCTS.filter(function (x) { return x.id === id; })[0];
      if (!p) return '';
      var unit = state.mode === 'retail' ? '/ কেজি' : '/ মণ';
      return '<li><span class="b-emoji" aria-hidden="true">' + p.emoji + '</span>' +
             '<span>' + esc(p.name) + '</span>' +
             '<span class="b-price">' + taka(activePrice(p)) + ' <span class="b-unit">' + unit + '</span></span></li>';
    }).join('');
    $('#boardList').innerHTML = rows;
    $('#boardMode').textContent = state.mode === 'retail' ? 'খুচরা' : 'পাইকারি';
  }

  /* ---------- চিপ (ক্যাটাগরি) ---------- */
  function renderChips() {
    $('#chips').innerHTML = CATEGORIES.map(function (c) {
      return '<button type="button" class="chip" data-cat="' + esc(c) + '" aria-pressed="' + (state.cat === c) + '">' + esc(c) + '</button>';
    }).join('');
  }

  /* ---------- পণ্যের গ্রিড ---------- */
  function filtered() {
    var q = state.q.trim().toLowerCase();
    var list = PRODUCTS.filter(function (p) {
      var okCat = state.cat === 'সব' || p.cat === state.cat;
      var okQ = !q || p.name.toLowerCase().indexOf(q) !== -1 || p.district.indexOf(q) !== -1 || p.farmer.indexOf(q) !== -1;
      return okCat && okQ;
    });
    if (state.sort === 'asc') list.sort(function (a, b) { return activePrice(a) / (state.mode === 'retail' ? 1 : 40) - activePrice(b) / (state.mode === 'retail' ? 1 : 40); });
    if (state.sort === 'desc') list.sort(function (a, b) { return activePrice(b) / (state.mode === 'retail' ? 1 : 40) - activePrice(a) / (state.mode === 'retail' ? 1 : 40); });
    return list;
  }

  function cardHTML(p) {
    var priceBlock;
    if (state.mode === 'retail') {
      priceBlock =
        '<strong>' + taka(p.retail) + '</strong> <span>/ কেজি</span>' +
        '<small>মজুত আছে ' + bn(p.stock) + ' মণ</small>';
    } else {
      priceBlock =
        '<strong>' + taka(p.wholesale) + '</strong> <span>/ মণ</span>' +
        '<small>প্রায় ' + taka(p.wholesale / 40) + ' / কেজি · ন্যূনতম ' + bn(p.minMon) + ' মণ</small>';
    }
    return '' +
      '<article class="card">' +
        '<div class="card-tile" style="background:' + (TILE_COLORS[p.cat] || '#eee') + '">' +
          '<span aria-hidden="true">' + p.emoji + '</span>' +
          '<span class="stock">' + esc(p.cat) + '</span>' +
        '</div>' +
        '<div class="card-body">' +
          '<h3 class="card-title">' + esc(p.name) + '</h3>' +
          '<p class="card-farmer">' + esc(p.farmer) + ', ' + esc(p.district) + '</p>' +
          '<div class="card-price">' + priceBlock + '</div>' +
          '<div class="card-actions">' +
            '<button class="btn btn-ghost btn-sm" data-chat="' + p.id + '">কথা বলুন</button>' +
            '<button class="btn btn-solid btn-sm" data-order="' + p.id + '">অর্ডার করুন</button>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  function renderGrid() {
    var list = filtered();
    $('#grid').innerHTML = list.map(cardHTML).join('');
    $('#empty').hidden = list.length > 0;
    $('#resultCount').textContent = bn(list.length) + 'টি পণ্য পাওয়া গেছে';
    $('#modeHint').textContent = state.mode === 'retail'
      ? 'খুচরা দামে কেজি হিসাবে কিনুন।'
      : 'পাইকারি দামে মণ হিসাবে কিনুন। প্রতি পণ্যের ন্যূনতম পরিমাণ আছে।';
  }

  function setMode(mode) {
    state.mode = mode;
    document.body.setAttribute('data-mode', mode);
    $$('[data-set-mode]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-set-mode') === mode));
    });
    renderBoard();
    renderGrid();
  }

  /* ---------- ড্রয়ার ---------- */
  var openDrawer = null;
  function showDrawer(el) {
    closeDrawers();
    el.classList.add('open');
    el.setAttribute('aria-hidden', 'false');
    $('#backdrop').hidden = false;
    openDrawer = el;
    var input = $('input', el);
    if (input) setTimeout(function () { input.focus(); }, 260);
  }
  function closeDrawers() {
    $$('.drawer').forEach(function (d) {
      d.classList.remove('open');
      d.setAttribute('aria-hidden', 'true');
    });
    $('#backdrop').hidden = true;
    openDrawer = null;
  }

  function addMsg(box, text, who, extraClass) {
    var d = document.createElement('div');
    d.className = 'msg ' + who + (extraClass ? ' ' + extraClass : '');
    d.textContent = text;           // textContent: ব্যবহারকারীর লেখা নিরাপদ
    box.appendChild(d);
    box.scrollTop = box.scrollHeight;
    return d;
  }

  /* ---------- কৃষকের সাথে চ্যাট (ডেমো) ---------- */
  var chatHistory = {};   // productId -> [{text, who}]
  var currentChat = null;

  function openChat(id) {
    var p = PRODUCTS.filter(function (x) { return x.id === id; })[0];
    if (!p) return;
    currentChat = p;
    $('#chatTitle').textContent = p.farmer;
    $('#chatSub').textContent = p.district + ' · কৃষক';
    $('#chatProduct').textContent = p.emoji + ' ' + p.name + ' · ' +
      (state.mode === 'retail' ? taka(p.retail) + ' / কেজি' : taka(p.wholesale) + ' / মণ');

    var box = $('#chatMessages');
    box.innerHTML = '';
    if (!chatHistory[id]) {
      chatHistory[id] = [{ text: 'আসসালামু আলাইকুম! ' + p.name + ' নিয়ে কিছু জানতে চাইলে লিখুন।', who: 'them' }];
    }
    chatHistory[id].forEach(function (m) { addMsg(box, m.text, m.who); });
    showDrawer($('#chatDrawer'));
  }

  function farmerReply(text, p) {
    if (/পাইকারি|মণ/.test(text)) {
      return 'পাইকারিতে ' + taka(p.wholesale) + ' / মণ। কমপক্ষে ' + bn(p.minMon) + ' মণ নিতে হবে।';
    }
    if (/কম|ছাড়|দর/.test(text)) {
      return 'পরিমাণ বেশি নিলে কিছু ছাড় দিতে পারব। কত নিতে চান বলুন।';
    }
    if (/কবে|কখন|পাঠ|ডেলিভারি/.test(text)) {
      return 'অর্ডার নিশ্চিত হলে ২ দিনের মধ্যে পাঠাতে পারব।';
    }
    return 'ঠিক আছে, বিষয়টা দেখছি। আর কিছু জানার থাকলে বলুন।';
  }

  function sendChat(text) {
    text = text.trim();
    if (!text || !currentChat) return;
    var box = $('#chatMessages');
    var p = currentChat;
    addMsg(box, text, 'me');
    chatHistory[p.id].push({ text: text, who: 'me' });
    var typing = addMsg(box, 'লিখছেন…', 'them', 'typing');
    setTimeout(function () {
      typing.remove();
      var reply = farmerReply(text, p);
      addMsg(box, reply, 'them');
      chatHistory[p.id].push({ text: reply, who: 'them' });
    }, 900);
  }

  /* ---------- এআই সহায়ক (ডেমো) ---------- */
  var aiStarted = false;

  function aiAnswer(q) {
    if (/রোগ|পাতা|কুঁকড়|পোকা|ছত্রাক|দাগ/.test(q)) {
      return 'পাতা কুঁকড়ানো বা পোকা লাগার কয়েকটি সাধারণ কারণ আছে: সাদা মাছি, জাব পোকা বা ভাইরাস। আক্রান্ত পাতা আলাদা করুন, জমিতে পানি জমতে দেবেন না। ছবি তুলে স্থানীয় উপসহকারী কৃষি কর্মকর্তাকে দেখান।';
    }
    if (/দাম|দর|মূল্য/.test(q)) {
      return 'দাম ঠিক করতে তিনটি জিনিস দেখুন: আপনার মোট খরচ, আশপাশের হাটের আজকের দর, আর পাইকারির পরিমাণ। পরিমাণ বেশি হলে মণপ্রতি দাম কিছু কম রাখলে ক্রেতা বেশি আগ্রহী হয়।';
    }
    if (/সংরক্ষ|ভালো রাখ|বেশিদিন|পচ/.test(q)) {
      return 'ফসল শুকনো, ঠান্ডা ও বাতাস চলাচল করে এমন জায়গায় রাখুন। পচা বা কাটা অংশ আগে বেছে ফেলুন। আলুর জন্য অন্ধকার ঘর ভালো, আলোতে সবুজ হয়ে যায়।';
    }
    return 'প্রশ্নটি বুঝেছি। আরেকটু বিস্তারিত লিখলে ভালো উত্তর দিতে পারব, যেমন কোন ফসল আর কী সমস্যা।';
  }

  function openAI(prompt) {
    var box = $('#aiMessages');
    if (!aiStarted) {
      addMsg(box, 'আসসালামু আলাইকুম! আমি আপনার কৃষি সহায়ক। ফসল, রোগবালাই বা দাম নিয়ে প্রশ্ন করুন।', 'them');
      aiStarted = true;
    }
    showDrawer($('#aiDrawer'));
    if (prompt) sendAI(prompt);
  }

  function sendAI(text) {
    text = text.trim();
    if (!text) return;
    var box = $('#aiMessages');
    addMsg(box, text, 'me');
    var typing = addMsg(box, 'ভাবছি…', 'them', 'typing');
    setTimeout(function () {
      typing.remove();
      addMsg(box, aiAnswer(text), 'them');
    }, 900);
  }

  /* ---------- লগইন / নিবন্ধন ---------- */
  var authMode = 'login';
  function setAuthTab(mode) {
    authMode = mode;
    var reg = mode === 'register';
    $('#authTitle').textContent = reg ? 'নিবন্ধন' : 'লগইন';
    $('#authSubmit').textContent = reg ? 'নিবন্ধন করুন' : 'লগইন করুন';
    $('#rolePick').hidden = !reg;
    $('#nameField').hidden = !reg;
    $('#a-pass').setAttribute('autocomplete', reg ? 'new-password' : 'current-password');
    $$('.tab').forEach(function (t) { t.setAttribute('aria-selected', String(t.getAttribute('data-tab') === mode)); });
    $('#authError').hidden = true;
  }
  function openAuth(mode) {
    setAuthTab(mode);
    var d = $('#authDialog');
    if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
  }

  /* ---------- ইভেন্ট ---------- */
  document.addEventListener('click', function (e) {
    var el;

    if ((el = e.target.closest('[data-set-mode]'))) { setMode(el.getAttribute('data-set-mode')); return; }

    if ((el = e.target.closest('.chip'))) {
      state.cat = el.getAttribute('data-cat');
      renderChips(); renderGrid(); return;
    }

    if ((el = e.target.closest('[data-chat]'))) { openChat(Number(el.getAttribute('data-chat'))); return; }

    if ((el = e.target.closest('[data-order]'))) {
      var p = PRODUCTS.filter(function (x) { return x.id === Number(el.getAttribute('data-order')); })[0];
      if (p) toast('অর্ডার করতে আগে লগইন করুন। (ডেমো: ' + p.name + ')');
      openAuth('login');
      return;
    }

    if ((el = e.target.closest('[data-auth]'))) { openAuth(el.getAttribute('data-auth')); return; }

    if ((el = e.target.closest('[data-open-ai]'))) { openAI(); return; }

    if ((el = e.target.closest('[data-ai-prompt]'))) { openAI(el.getAttribute('data-ai-prompt')); return; }

    if (e.target.closest('[data-close]') || e.target === $('#backdrop')) { closeDrawers(); return; }

    if ((el = e.target.closest('.tab'))) { setAuthTab(el.getAttribute('data-tab')); return; }

    if ((el = e.target.closest('#chatQuick button'))) { sendChat(el.textContent); return; }
    if ((el = e.target.closest('#aiQuick button'))) { sendAI(el.textContent); return; }

    if (e.target.id === 'resetFilters') {
      state.cat = 'সব'; state.q = ''; state.sort = 'default';
      $('#q').value = ''; $('#sort').value = 'default';
      renderChips(); renderGrid();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && openDrawer) closeDrawers();
  });

  $('#q').addEventListener('input', function (e) { state.q = e.target.value; renderGrid(); });
  $('#sort').addEventListener('change', function (e) { state.sort = e.target.value; renderGrid(); });

  $('#heroSearch').addEventListener('submit', function (e) {
    e.preventDefault();
    state.q = $('#heroQ').value;
    $('#q').value = state.q;
    renderGrid();
    $('#bazar').scrollIntoView({ behavior: 'smooth' });
  });

  $('#chatForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var i = $('#chatInput');
    sendChat(i.value);
    i.value = '';
  });

  $('#aiForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var i = $('#aiInput');
    sendAI(i.value);
    i.value = '';
  });

  $('#authClose').addEventListener('click', function () { $('#authDialog').close(); });

  $('#authForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var phone = $('#a-phone').value.trim();
    var pass = $('#a-pass').value;
    var name = $('#a-name').value.trim();
    var err = $('#authError');
    var msg = '';

    if (authMode === 'register' && !name) msg = 'আপনার নাম লিখুন।';
    else if (!/^01[3-9]\d{8}$/.test(phone)) msg = 'সঠিক মোবাইল নম্বর দিন (যেমন: 01712345678)।';
    else if (pass.length < 6) msg = 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।';

    if (msg) { err.textContent = msg; err.hidden = false; return; }
    err.hidden = true;
    $('#authDialog').close();
    toast(authMode === 'register' ? 'নিবন্ধন সম্পন্ন (ডেমো)।' : 'লগইন সম্পন্ন (ডেমো)।');
    e.target.reset();
  });

  $('#sellForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var err = $('#sellError');
    var name = $('#f-name').value.trim();
    var district = $('#f-district').value.trim();
    var retail = Number($('#f-retail').value);
    var whole = Number($('#f-whole').value);
    var minMon = Number($('#f-min').value);
    var stock = Number($('#f-stock').value);
    var cat = $('#f-cat').value;

    if (!name || !district) { err.textContent = 'পণ্যের নাম ও জেলা লিখুন।'; err.hidden = false; return; }
    if (!(retail > 0) || !(whole > 0)) { err.textContent = 'খুচরা ও পাইকারি দাম দিন।'; err.hidden = false; return; }
    if (!(minMon > 0) || !(stock > 0)) { err.textContent = 'ন্যূনতম পরিমাণ ও মজুত দিন।'; err.hidden = false; return; }
    if (minMon > stock) { err.textContent = 'ন্যূনতম পরিমাণ মজুতের চেয়ে বেশি হতে পারে না।'; err.hidden = false; return; }
    err.hidden = true;

    PRODUCTS.unshift({
      id: nextId++, name: name, emoji: CAT_EMOJI[cat] || '🌱', cat: cat,
      farmer: 'আপনি', district: district,
      retail: retail, wholesale: whole, minMon: minMon, stock: stock
    });
    state.cat = 'সব'; state.q = '';
    $('#q').value = '';
    renderChips(); renderGrid();
    e.target.reset();
    $('#f-min').value = 2;
    toast('"' + name + '" বাজারে যোগ হয়েছে।');
    $('#bazar').scrollIntoView({ behavior: 'smooth' });
  });

  /* ---------- শুরু ---------- */
  renderChips();
  renderBoard();
  renderGrid();
})();
