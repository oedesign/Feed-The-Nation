const scriptures = [
  '“When ye are in the service of your fellow beings ye are only in the service of your God.” — Mosiah 2:17',
  '“I can do all things through Christ which strengtheneth me.” — Philippians 4:13',
  '“Be not weary in well-doing, for ye are laying the foundation of a great work.” — Doctrine and Covenants 64:33',
  '“Bear ye one another’s burdens.” — Galatians 6:2'
];

const navItems = [
  ['index.html','Home'],['community-support-hub.html','Community Services'],['programs.html','Programs'],['jobs.html','Jobs'],['surveys.html','FTN Surveys'],['marketplace.html','FTN Marketplace'],['about.html','About Us'],['resources.html','Resources'],['events.html','Events / Outreach'],['contact.html','Contact']
];

function authUser(){ return JSON.parse(localStorage.getItem('ftnUser') || 'null'); }
function renderShell() {
  const user = authUser();
  const top = document.getElementById('global-top');
  const header = document.getElementById('global-header');
  const footer = document.getElementById('global-footer');
  if (top) top.innerHTML = `<div class="top-banner"><div class="container" id="scriptureText" aria-live="polite"></div></div>`;
  if (header) header.innerHTML = `
    <header class="site-header"><div class="container nav-wrap">
      <a class="brand" href="index.html">Feed the Nation</a>
      <button class="menu-btn" id="menuBtn" aria-label="Toggle menu">☰</button>
      <nav class="nav-links" id="navLinks">${navItems.map(n => `<a href="${n[0]}">${n[1]}</a>`).join('')}
      <div class="auth-links">${user ? `<a class="btn secondary" href="dashboard.html">${user.name}</a><button class="btn" id="logoutBtn">Logout</button>` : `<a class="btn secondary" href="login.html">Login</a><a class="btn" href="signup.html">Sign Up</a>`}</div></nav>
    </div></header>`;
  if (footer) footer.innerHTML = `
    <footer class="footer"><div class="container footer-grid">
      <div><h3>Feed the Nation</h3><p class="small">Helping communities across Nigeria access verified support, opportunities, and hope.</p></div>
      <div><h4>Platform</h4><a href="community-support-hub.html">Services</a><br><a href="programs.html">Programs</a><br><a href="jobs.html">Jobs</a></div>
      <div><h4>Company</h4><a href="about.html">About</a><br><a href="partnerships.html">Partnerships</a><br><a href="success-stories.html">Success Stories</a></div>
      <div><h4>Support</h4><a href="faq.html">FAQ</a><br><a href="contact.html">Contact</a><br><a href="volunteer.html">Get Involved</a></div>
      <div><h4>Legal</h4><a href="#">Privacy</a><br><a href="#">Terms</a><p class="small">hello@ftn.ng<br>+234 800 000 0000</p></div>
    </div></footer>`;

  const navLinks = document.getElementById('navLinks');
  document.getElementById('menuBtn')?.addEventListener('click', () => navLinks.classList.toggle('open'));
  document.getElementById('logoutBtn')?.addEventListener('click', () => { localStorage.removeItem('ftnUser'); location.href='index.html'; });
}

function rotateScriptures() {
  const el = document.getElementById('scriptureText');
  if (!el) return;
  let i = 0;
  const paint = () => el.textContent = scriptures[i % scriptures.length];
  paint();
  setInterval(() => { i++; paint(); }, 5000);
}

function initChatbot() {
  const chatbot = document.getElementById('chatbot');
  if (!chatbot) return;
  chatbot.innerHTML = `<div class="chat-window" id="chatWin"><div class="chat-head">FTN Assistant</div><div class="chat-body" id="chatBody"><p>Welcome 👋 Ask about signup, programs, jobs, surveys, dashboard, and marketplace.</p></div><div class="chat-input"><input id="chatInput" placeholder="Type your question" /><button id="chatSend">Send</button></div></div><button class="btn" id="chatToggle">Need Help?</button>`;
  const map = {
    signup: 'Use Sign Up to create your account with email and password, then access your dashboard.',
    program: 'Go to Programs page to browse opportunities and apply.',
    job: 'Go to Jobs page to search roles by keyword and location.',
    survey: 'Open FTN Surveys to complete community needs forms and feedback.',
    dashboard: 'Dashboard tracks your saved items, applications, and survey activity.',
    marketplace: 'Use FTN Marketplace to find listings and contact sellers.'
  };
  const body = document.getElementById('chatBody');
  document.getElementById('chatToggle').onclick = () => document.getElementById('chatWin').classList.toggle('open');
  document.getElementById('chatSend').onclick = () => {
    const q = document.getElementById('chatInput').value.toLowerCase();
    if (!q) return;
    const key = Object.keys(map).find(k => q.includes(k));
    body.innerHTML += `<p><strong>You:</strong> ${q}</p><p><strong>FTN:</strong> ${key ? map[key] : 'Please use the menu links. I can help with signup, programs, jobs, surveys, dashboard, and marketplace.'}</p>`;
    document.getElementById('chatInput').value='';
    body.scrollTop = body.scrollHeight;
  };
}

function initAuthForms() {
  const signup = document.getElementById('signupForm');
  if (signup) signup.onsubmit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(signup).entries());
    if (data.password !== data.confirmPassword) return alert('Passwords do not match');
    localStorage.setItem('ftnUser', JSON.stringify({name:data.fullName,email:data.email}));
    location.href = 'dashboard.html';
  };
  const login = document.getElementById('loginForm');
  if (login) login.onsubmit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(login).entries());
    localStorage.setItem('ftnUser', JSON.stringify({name:data.email.split('@')[0],email:data.email}));
    location.href = 'dashboard.html';
  };
  if (document.body.dataset.page === 'dashboard' && !authUser()) location.href='login.html';
}

function trackButtons(){
  document.querySelectorAll('[data-track]').forEach(btn => btn.addEventListener('click',()=>{
    const arr = JSON.parse(localStorage.getItem('ftnTracking') || '[]');
    arr.push({action:btn.dataset.track,date:new Date().toISOString()});
    localStorage.setItem('ftnTracking', JSON.stringify(arr.slice(-100)));
    if(btn.dataset.saved) alert('Saved to your dashboard activity.');
  }));
  const stats = document.getElementById('dashboardStats');
  if(stats){
    const arr = JSON.parse(localStorage.getItem('ftnTracking') || '[]');
    stats.innerHTML = `<div class="kpi"><h3>${arr.filter(a=>a.action.includes('service')).length}</h3><p>Services Activity</p></div>
    <div class="kpi"><h3>${arr.filter(a=>a.action.includes('program')).length}</h3><p>Programs Activity</p></div>
    <div class="kpi"><h3>${arr.filter(a=>a.action.includes('job')).length}</h3><p>Job Activity</p></div>
    <div class="kpi"><h3>${arr.filter(a=>a.action.includes('survey')).length}</h3><p>Survey Activity</p></div>
    <div class="kpi"><h3>${arr.filter(a=>a.action.includes('marketplace')).length}</h3><p>Marketplace Activity</p></div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderShell();
  rotateScriptures();
  initChatbot();
  initAuthForms();
  trackButtons();
});
