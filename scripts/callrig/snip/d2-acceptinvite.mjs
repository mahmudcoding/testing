const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const LINK = 'https://airion-cargo.store/invite?token=4qCajlUTAq_yReCplqllVlIIUU923Xhe1RCa1alspmk%3D';
export default async ({ page }) => {
  const out = {};
  const net=[];
  page.on('response', async r => { const u=r.url(); if(!/invite|workspace|auth/i.test(u)) return;
    if (r.request().method()==='GET' && !/invite/i.test(u)) return;
    let b=''; try{b=(await r.text()).slice(0,200);}catch{}
    net.push(`${r.request().method()} ${u.replace(/^https?:\/\/[^/]+/,'').slice(0,48)} -> ${r.status()} ${b.slice(0,110)}`); });
  // sign in as outsider first
  await page.goto('https://airion-cargo.store/login', { waitUntil:'networkidle' });
  await page.waitForTimeout(2200);
  const needLogin = await page.evaluate(async () => (await fetch('/api/v1/auth/me',{credentials:'include'})).status !== 200);
  if (needLogin) {
    await page.fill('input[type=email]', 'qa.d.outsider@aloqa.test');
    await page.fill('input[type=password]', 'QaPass123!');
    await page.locator('button[type=submit], button:has-text("Sign in")').first().click().catch(()=>{});
    await page.waitForTimeout(6000);
  }
  out.signedInAs = await page.evaluate(async () => { const r=await fetch('/api/v1/auth/me',{credentials:'include'});
    if (r.status!==200) return 'NOT SIGNED IN ('+r.status+')'; const j=await r.json(); return (j.user||j).email; });
  out.workspacesBefore = await page.evaluate(async () => {
    const r=await fetch('/api/v1/users/me/workspaces',{credentials:'include'});
    if(r.status!==200) return 'status '+r.status; const j=await r.json();
    const a=Array.isArray(j)?j:(j.workspaces||j.items||[]); return a.map(w=>w.name||w.id); });
  net.length=0;
  await page.goto(LINK, { waitUntil:'networkidle' });
  await page.waitForTimeout(4000);
  out.landingUrl = page.url().replace(/^https?:\/\/[^/]+/,'').replace(/token=[^&]+/,'token=<TOKEN>');
  out.landingContent = await page.evaluate(`(() => { const vis=(${VIS});
    const m=document.querySelector('main')||document.body;
    const btns=[...m.querySelectorAll('button,a')].filter(vis).map(b=>(b.innerText||b.getAttribute('aria-label')||'').trim()).filter(Boolean).slice(0,10);
    return { text:(m.innerText||'').replace(/\\n+/g,' | ').slice(0,300), buttons: btns }; })()`);
  // accept if there is an explicit control
  const accept = page.locator('button:has-text("Join"), button:has-text("Accept"), button:has-text("Continue")').first();
  if (await accept.count()) { await accept.scrollIntoViewIfNeeded(); await accept.click().catch(()=>{}); await page.waitForTimeout(5000);
    out.afterAcceptUrl = page.url().replace(/^https?:\/\/[^/]+/,''); out.clickedAccept = true; }
  else out.clickedAccept = false;
  out.workspacesAfter = await page.evaluate(async () => {
    const r=await fetch('/api/v1/users/me/workspaces',{credentials:'include'});
    if(r.status!==200) return 'status '+r.status; const j=await r.json();
    const a=Array.isArray(j)?j:(j.workspaces||j.items||[]); return a.map(w=>w.name||w.id); });
  out.requests = net.slice(0,10);
  return out;
};
