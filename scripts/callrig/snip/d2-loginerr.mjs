const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const NOTICES = `() => { const vis=(${VIS});
  return [...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast],p,span,div')].filter(vis)
    .map(e=>(e.innerText||'').trim())
    .filter(t=>t && t.length<160 && /invalid|incorrect|wrong|not found|does not|no account|error|failed|try again|blocked|too many|verify|check/i.test(t))
    .filter((v,i,a)=>a.indexOf(v)===i).slice(0,5); }`;
export default async ({ page }) => {
  const out = { cases: [] };
  const attempt = async (email, pw, note) => {
    await page.goto('https://airion-cargo.store/login', { waitUntil:'networkidle' });
    await page.waitForTimeout(1800);
    const em = page.locator('input[type=email], input[name=email]').first();
    const pwd = page.locator('input[type=password]').first();
    if (!(await em.count()) || !(await pwd.count())) return { note, err:'form not found' };
    await em.fill(email); await pwd.fill(pw);
    const net=[]; const on = async r => { if(!r.url().includes('/api/v1/')) return;
      let b=''; try{b=(await r.text()).slice(0,200);}catch{}
      net.push(`${r.request().method()} ${r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,40)} -> ${r.status()} ${b}`); };
    page.on('response', on);
    let notices=[];
    const poll=setInterval(async()=>{ try{ const n=await page.evaluate(`(${NOTICES})()`); if(n.length>notices.length) notices=n; }catch{} },250);
    const submit = page.locator('button[type=submit], button:has-text("Sign in")').first();
    await submit.click().catch(()=>{});
    await page.waitForTimeout(4500);
    clearInterval(poll); page.off('response', on);
    return { note, requests: net, noticesShown: notices,
             urlAfter: page.url().replace(/^https?:\/\/[^/]+/,'') };
  };
  // make sure we are signed out
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/account', { waitUntil:'networkidle' }).catch(()=>{});
  await page.waitForTimeout(1500);
  out.logout = await page.evaluate(async () => {
    const tries = ['/api/v1/auth/logout','/api/v1/auth/sign-out','/api/v1/auth/signout','/api/v1/auth/session'];
    const res = [];
    for (const u of tries) {
      const m = u.endsWith('session') ? 'DELETE' : 'POST';
      const r = await fetch(u, { method:m, credentials:'include' });
      res.push(m+' '+u+' -> '+r.status);
      if (r.status < 300) break;
    }
    return res;
  });
  await page.context().clearCookies().catch(()=>{});
  await page.goto('https://airion-cargo.store/login', { waitUntil:'networkidle' });
  await page.waitForTimeout(1800);
  out.authStatusAtStart = await page.evaluate(async () => (await fetch('/api/v1/auth/me',{credentials:'include'})).status);
  out.cases.push(await attempt('qa.d.outsider@aloqa.test', 'WrongPassword123!', 'existing account, wrong password'));
  out.cases.push(await attempt('definitely.not.a.user.qa@aloqa.test', 'WrongPassword123!', 'unknown account'));
  out.cases.push(await attempt('not-an-email', 'x', 'malformed email'));
  return out;
};
