const scriptures = [
  '“When ye are in the service of your fellow beings ye are only in the service of your God.” — Mosiah 2:17',
  '“I can do all things through Christ which strengtheneth me.” — Philippians 4:13',
  '“Be not weary in well-doing, for ye are laying the foundation of a great work.” — Doctrine and Covenants 64:33',
  '“Bear ye one another’s burdens.” — Galatians 6:2'
];

const navItems = [
  ['index.html', 'Home'], ['community-support-hub.html', 'Community Services'], ['programs.html', 'Programs'],
  ['jobs.html', 'Jobs'], ['surveys.html', 'FTN Surveys'], ['marketplace.html', 'Marketplace'],
  ['about.html', 'About'], ['resources.html', 'Resources'], ['events.html', 'Events'], ['donate-sponsor.html', 'Donate & Sponsor'], ['contact.html', 'Contact']
];

function parseJSON(value, fallback) {
  try { return JSON.parse(value); } catch { return fallback; }
}

function normalizeEmail(email = '') { return email.trim().toLowerCase(); }
function authUser() { return parseJSON(localStorage.getItem('ftnUser') || 'null', null); }
function setAuthUser(user) { localStorage.setItem('ftnUser', JSON.stringify(user)); }
function allUsers() { return parseJSON(localStorage.getItem('ftnUsers') || '{}', {}); }
function setAllUsers(users) { localStorage.setItem('ftnUsers', JSON.stringify(users)); }

function generateReferralCode(seed = '') {
  const base = seed.replace(/[^a-z0-9]/gi, '').slice(0, 5).toUpperCase() || 'FTN';
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${base}-${suffix}`;
}

function findUserByReferralCode(code) {
  const users = allUsers();
  const cleanCode = (code || '').trim().toUpperCase();
  return Object.values(users).find((user) => user.referralCode === cleanCode);
}

function saveUser(user) {
  const users = allUsers();
  users[normalizeEmail(user.email)] = user;
  setAllUsers(users);
}

function getCurrentUserRecord() {
  const user = authUser();
  if (!user?.email) return null;
  return allUsers()[normalizeEmail(user.email)] || null;
}

function refreshAuthUserFromDB() {
  const dbUser = getCurrentUserRecord();
  if (!dbUser) return;
  const sessionUser = authUser() || {};
  setAuthUser({ ...sessionUser, name: dbUser.name, email: dbUser.email, avatar: dbUser.avatar });
}

function profileInitial(name = '') {
  return (name.trim().charAt(0) || 'U').toUpperCase();
}

function renderShell() {
  refreshAuthUserFromDB();
  const user = authUser();
  const currentPath = location.pathname.split('/').pop() || 'index.html';
  const top = document.getElementById('global-top');
  const header = document.getElementById('global-header');
  const footer = document.getElementById('global-footer');

  if (top) top.innerHTML = `<div class="top-banner"><div class="container" id="scriptureText" aria-live="polite"></div></div>`;
  if (header) header.innerHTML = `
    <header class="site-header"><div class="container nav-wrap">
      <a class="brand" href="index.html">Feed the Nation</a>
      <button class="menu-btn" id="menuBtn" aria-label="Toggle menu">☰</button>
      <nav class="nav-links" id="navLinks">
        ${navItems.map(([href, label]) => `<a class="${currentPath === href ? 'active-link' : ''}" href="${href}">${label}</a>`).join('')}
      </nav>
      <div class="auth-links">
        ${user ? `
          <a class="profile-link" href="dashboard.html" aria-label="Open your dashboard">
            ${user.avatar ? `<img class="profile-avatar" src="${user.avatar}" alt="${user.name} avatar">` : `<span class="profile-avatar profile-fallback">${profileInitial(user.name)}</span>`}
            <span class="profile-name">${user.name}</span>
          </a>
          <button class="btn secondary" id="logoutBtn">Logout</button>
        ` : `<a class="btn secondary" href="login.html">Login</a><a class="btn" href="signup.html">Sign Up</a>`}
      </div>
      </div></header>`;

  if (footer) footer.innerHTML = `
    <footer class="footer"><div class="container footer-grid">
      <div><h3>Feed the Nation</h3><p class="small">Helping communities across Nigeria access verified support, opportunities, and hope.</p></div>
      <div><h4>Platform</h4><a href="community-support-hub.html">Services</a><br><a href="programs.html">Programs</a><br><a href="jobs.html">Jobs</a></div>
      <div><h4>Growth</h4><a href="dashboard.html">Dashboard</a><br><a href="signup.html">Referral Rewards</a><br><a href="marketplace.html">Marketplace</a></div>
      <div><h4>Company</h4><a href="about.html">About</a><br><a href="partnerships.html">Partnerships</a><br><a href="success-stories.html">Success Stories</a></div>
      <div><h4>Support</h4><a href="faq.html">FAQ</a><br><a href="donate-sponsor.html">Donate & Sponsor</a><br><a href="contact.html">Contact</a><p class="small">hello@ftn.ng<br>+234 800 000 0000</p></div>
    </div></footer>`;

  const navLinks = document.getElementById('navLinks');
  document.getElementById('menuBtn')?.addEventListener('click', () => navLinks?.classList.toggle('open'));
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('ftnUser');
    location.href = 'index.html';
  });
}

function rotateScriptures() {
  const el = document.getElementById('scriptureText');
  if (!el) return;
  let i = 0;
  const paint = () => { el.textContent = scriptures[i % scriptures.length]; };
  paint();
  setInterval(() => { i += 1; paint(); }, 5000);
}

function initChatbot() {
  const chatbot = document.getElementById('chatbot');
  if (!chatbot) return;
  chatbot.innerHTML = `<div class="chat-window" id="chatWin"><div class="chat-head">FTN Assistant</div><div class="chat-body" id="chatBody"><p>Welcome 👋 Ask about signup, programs, jobs, surveys, dashboard, referrals, and marketplace.</p></div><div class="chat-input"><input id="chatInput" placeholder="Type your question" /><button id="chatSend">Send</button></div></div><button class="btn" id="chatToggle">Need Help?</button>`;
  const map = {
    signup: 'Use Sign Up to create your account. You can also enter a referral code to receive 100 coins (₦5,000 value).',
    referral: 'Each user gets a unique referral code. Successful referral signups reward new users with 100 coins.',
    program: 'Go to Programs to browse PADE opportunities. Purchases are tracked in your dashboard history.',
    job: 'Go to Jobs page to search roles by keyword and location.',
    survey: 'Open FTN Surveys to complete community needs forms and feedback.',
    dashboard: 'Dashboard shows wallet coins, referrals, purchased programs, marketplace history, and account settings.',
    marketplace: 'Use FTN Marketplace to find listings and track marketplace actions in your dashboard.',
    donate: 'Visit Donate & Sponsor to support community projects through one-time gifts, monthly giving, or sponsorship packages.',
    sponsor: 'Visit Donate & Sponsor to support community projects through one-time gifts, monthly giving, or sponsorship packages.'
  };
  const body = document.getElementById('chatBody');
  document.getElementById('chatToggle').onclick = () => document.getElementById('chatWin')?.classList.toggle('open');
  document.getElementById('chatSend').onclick = () => {
    const input = document.getElementById('chatInput');
    const q = input.value.toLowerCase().trim();
    if (!q) return;
    const key = Object.keys(map).find((k) => q.includes(k));
    body.innerHTML += `<p><strong>You:</strong> ${q}</p><p><strong>FTN:</strong> ${key ? map[key] : 'Please use the menu links. I can help with signup, referrals, programs, jobs, surveys, dashboard, and marketplace.'}</p>`;
    input.value = '';
    body.scrollTop = body.scrollHeight;
  };
}

function initAuthForms() {
  const signup = document.getElementById('signupForm');
  if (signup) signup.onsubmit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(signup).entries());
    if (data.password !== data.confirmPassword) return alert('Passwords do not match.');

    const email = normalizeEmail(data.email);
    const users = allUsers();
    if (users[email]) return alert('An account with this email already exists.');

    const referrer = data.referralCode ? findUserByReferralCode(data.referralCode) : null;
    const rewardHistory = [];
    let initialCoins = 0;

    if (referrer) {
      initialCoins += 100;
      rewardHistory.push({ type: 'signup_referral_bonus', coins: 100, note: `Joined with ${referrer.referralCode}`, date: new Date().toISOString() });
    }

    const newUser = {
      name: data.fullName,
      email,
      phone: data.phone || '',
      state: data.state || '',
      lga: data.lga || '',
      avatar: '',
      referralCode: generateReferralCode(data.fullName),
      referredBy: referrer?.email || '',
      referralCount: 0,
      referrals: [],
      coins: initialCoins,
      purchasedPrograms: [],
      marketplaceHistory: [],
      rewardHistory
    };

    users[email] = newUser;

    if (referrer) {
      const referrerEmail = normalizeEmail(referrer.email);
      users[referrerEmail].referralCount = (users[referrerEmail].referralCount || 0) + 1;
      users[referrerEmail].referrals = users[referrerEmail].referrals || [];
      users[referrerEmail].referrals.push({
        name: newUser.name,
        email: newUser.email,
        date: new Date().toISOString(),
        status: 'successful'
      });
      users[referrerEmail].rewardHistory = users[referrerEmail].rewardHistory || [];
      users[referrerEmail].rewardHistory.push({
        type: 'successful_referral',
        coins: 0,
        note: `${newUser.name} registered using your referral code.`,
        date: new Date().toISOString()
      });
    }

    setAllUsers(users);
    setAuthUser({ name: newUser.name, email: newUser.email, avatar: newUser.avatar });
    location.href = 'dashboard.html';
  };

  const login = document.getElementById('loginForm');
  if (login) login.onsubmit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(login).entries());
    const email = normalizeEmail(data.email);
    const existingUser = allUsers()[email];

    if (!existingUser) {
      const fallback = {
        name: data.email.split('@')[0],
        email,
        avatar: '',
        referralCode: generateReferralCode(data.email),
        referredBy: '',
        referralCount: 0,
        referrals: [],
        coins: 0,
        purchasedPrograms: [],
        marketplaceHistory: [],
        rewardHistory: []
      };
      saveUser(fallback);
      setAuthUser({ name: fallback.name, email: fallback.email, avatar: fallback.avatar });
    } else {
      setAuthUser({ name: existingUser.name, email: existingUser.email, avatar: existingUser.avatar });
    }

    location.href = 'dashboard.html';
  };

  if (document.body.dataset.page === 'dashboard' && !authUser()) location.href = 'login.html';
}

function formatDate(isoString) {
  if (!isoString) return '-';
  return new Date(isoString).toLocaleDateString();
}

function bindDashboard() {
  if (document.body.dataset.page !== 'dashboard') return;
  const user = getCurrentUserRecord();
  if (!user) return;

  const nameEl = document.getElementById('profileName');
  const emailEl = document.getElementById('profileEmail');
  const refCodeEl = document.getElementById('referralCode');
  const coinEl = document.getElementById('coinBalance');
  const referralCountEl = document.getElementById('referralCount');
  const programCountEl = document.getElementById('programCount');
  const marketCountEl = document.getElementById('marketCount');
  const profilePreview = document.getElementById('dashboardAvatarPreview');

  if (nameEl) nameEl.textContent = user.name;
  if (emailEl) emailEl.textContent = user.email;
  if (refCodeEl) refCodeEl.textContent = user.referralCode;
  if (coinEl) coinEl.textContent = user.coins ?? 0;
  if (referralCountEl) referralCountEl.textContent = user.referralCount ?? 0;
  if (programCountEl) programCountEl.textContent = user.purchasedPrograms?.length ?? 0;
  if (marketCountEl) marketCountEl.textContent = user.marketplaceHistory?.length ?? 0;
  if (profilePreview) {
    profilePreview.innerHTML = user.avatar ? `<img src="${user.avatar}" alt="${user.name} avatar">` : `<span>${profileInitial(user.name)}</span>`;
  }

  const referralsWrap = document.getElementById('referralActivity');
  if (referralsWrap) {
    referralsWrap.innerHTML = (user.referrals?.length ? user.referrals : [{ name: 'No referrals yet', email: '-', status: '-', date: '' }])
      .map((r) => `<li><strong>${r.name}</strong> • ${r.email} • ${r.status} ${r.date ? `• ${formatDate(r.date)}` : ''}</li>`).join('');
  }

  const rewardsWrap = document.getElementById('rewardHistory');
  if (rewardsWrap) {
    rewardsWrap.innerHTML = (user.rewardHistory?.length ? user.rewardHistory : [{ note: 'No reward history yet.', coins: 0, date: '' }])
      .map((item) => `<li>${item.note} ${item.coins ? `<strong>(+${item.coins} coins)</strong>` : ''} ${item.date ? `• ${formatDate(item.date)}` : ''}</li>`).join('');
  }

  const accountForm = document.getElementById('accountSettingsForm');
  if (accountForm) {
    accountForm.fullName.value = user.name || '';
    accountForm.phone.value = user.phone || '';
    accountForm.state.value = user.state || '';
    accountForm.lga.value = user.lga || '';
    accountForm.onsubmit = (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(accountForm).entries());
      user.name = data.fullName || user.name;
      user.phone = data.phone || '';
      user.state = data.state || '';
      user.lga = data.lga || '';
      saveUser(user);
      setAuthUser({ name: user.name, email: user.email, avatar: user.avatar });
      alert('Account settings updated.');
      location.reload();
    };
  }

  const avatarInput = document.getElementById('avatarInput');
  if (avatarInput) {
    avatarInput.onchange = () => {
      const file = avatarInput.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        user.avatar = String(reader.result);
        saveUser(user);
        setAuthUser({ name: user.name, email: user.email, avatar: user.avatar });
        location.reload();
      };
      reader.readAsDataURL(file);
    };
  }
}

function trackButtons() {
  const user = getCurrentUserRecord();
  document.querySelectorAll('[data-track]').forEach((btn) => btn.addEventListener('click', () => {
    const tracking = parseJSON(localStorage.getItem('ftnTracking') || '[]', []);
    const action = btn.dataset.track;
    tracking.push({ action, date: new Date().toISOString() });
    localStorage.setItem('ftnTracking', JSON.stringify(tracking.slice(-100)));

    if (user) {
      if (action.includes('program') && action.includes('applied')) {
        user.purchasedPrograms = user.purchasedPrograms || [];
        user.purchasedPrograms.push({ item: 'PADE Program Skill', date: new Date().toISOString(), coinsUsed: 25 });
        user.coins = Math.max(0, (user.coins || 0) - 25);
        user.rewardHistory = user.rewardHistory || [];
        user.rewardHistory.push({ type: 'program_purchase', coins: -25, note: 'Used 25 coins on a PADE program skill.', date: new Date().toISOString() });
      }
      if (action.includes('marketplace') && action.includes('contact')) {
        user.marketplaceHistory = user.marketplaceHistory || [];
        user.marketplaceHistory.push({ item: 'Marketplace listing interest', date: new Date().toISOString(), coinsUsed: 10 });
        user.coins = Math.max(0, (user.coins || 0) - 10);
        user.rewardHistory = user.rewardHistory || [];
        user.rewardHistory.push({ type: 'marketplace_purchase', coins: -10, note: 'Used 10 coins on a marketplace action.', date: new Date().toISOString() });
      }
      saveUser(user);
    }

    if (btn.dataset.saved) alert('Saved to your dashboard activity.');
  }));

  const stats = document.getElementById('dashboardStats');
  if (stats) {
    const tracking = parseJSON(localStorage.getItem('ftnTracking') || '[]', []);
    stats.innerHTML = `<div class="kpi"><h3>${tracking.filter((a) => a.action.includes('service')).length}</h3><p>Services Activity</p></div>
    <div class="kpi"><h3>${tracking.filter((a) => a.action.includes('program')).length}</h3><p>Programs Activity</p></div>
    <div class="kpi"><h3>${tracking.filter((a) => a.action.includes('job')).length}</h3><p>Job Activity</p></div>
    <div class="kpi"><h3>${tracking.filter((a) => a.action.includes('survey')).length}</h3><p>Survey Activity</p></div>
    <div class="kpi"><h3>${tracking.filter((a) => a.action.includes('marketplace')).length}</h3><p>Marketplace Activity</p></div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderShell();
  rotateScriptures();
  initChatbot();
  initAuthForms();
  trackButtons();
  bindDashboard();
});
