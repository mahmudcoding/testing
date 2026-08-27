const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const net=[];
  page.on('response', async r => { if(r.request().method()==='GET') return; const u=r.url();
    if(!/block/i.test(u)) return; let b=''; try{b=(await r.text()).slice(0,120);}catch{}
    net.push(`${r.request().method()} ${u.replace(/^https?:\/\/[^/]+/,'').slice(0,44)} -> ${r.status()} ${b.slice(0,70)}`); });
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/privacy', { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const out={};
  out.before = await page.evaluate(async () => {
    const j=await (await fetch('/api/v1/messaging/users/blocked?limit=50',{credentials:'include'})).json();
    const a=j.blocked||j.items||(Array.isArray(j)?j:[]); return a.length; });
  let notices=[];
  const poll=setInterval(async()=>{ try{ const n=await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')].filter(vis)
      .map(e=>(e.innerText||'').trim()).filter(Boolean); })()`); if(n.length>notices.length) notices=n; }catch{} },250);
  net.length=0;
  const btn = page.locator('button:has-text("Unblock")').first();
  out.unblockFound = await btn.count();
  if (out.unblockFound) { await btn.scrollIntoViewIfNeeded(); await btn.click(); await page.waitForTimeout(5000); }
  clearInterval(poll);
  out.requests=net; out.notices=notices;
  out.after = await page.evaluate(async () => {
    const j=await (await fetch('/api/v1/messaging/users/blocked?limit=50',{credentials:'include'})).json();
    const a=j.blocked||j.items||(Array.isArray(j)?j:[]); return a.length; });
  out.listNow = await page.evaluate(`(() => { const main=document.querySelector('main')||document.body;
    const t=(main.innerText||''); const i=t.indexOf('Blocked users');
    return (i>=0?t.slice(i):t).replace(/\\n+/g,' | ').slice(0,170); })()`);
  return out;
};
