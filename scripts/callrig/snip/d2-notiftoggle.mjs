const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const WANT = process.env.D2_WANT === 'on' ? 'true' : 'false';
  const net=[];
  page.on('response', async r => { if(r.request().method()==='GET') return; const u=r.url();
    if(!/notification/i.test(u)) return; let b=''; try{b=(await r.text()).slice(0,160);}catch{}
    net.push(`${r.request().method()} ${u.replace(/^https?:\/\/[^/]+/,'').slice(0,42)} -> ${r.status()} ${(r.request().postData()||'').slice(0,120)}`); });
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/notifications', { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const h = await page.evaluateHandle(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('main [role=switch]')].filter(vis).find(e=>{ let n=e.parentElement,box=null;
      for(let k=0;k<6&&n;k++){ if(n.querySelectorAll('[role=switch]').length===1) box=n; else break; n=n.parentElement; }
      return ((box?box.innerText:'')||'').includes('In-app notifications'); }) || null; })()`);
  const el=h.asElement(); if(!el) return { err:'switch not found' };
  await el.scrollIntoViewIfNeeded();
  const before = await el.evaluate(e=>e.getAttribute('aria-checked'));
  if (before !== WANT) { await el.click(); await page.waitForTimeout(1000); }
  const afterClick = await el.evaluate(e=>e.getAttribute('aria-checked'));
  // the notifications page uses a Save bar
  const save = page.locator('button').filter({hasText:/^Save/}).first();
  let saved=null;
  if (await save.count()) { saved=(await save.innerText()).trim(); await save.scrollIntoViewIfNeeded(); await save.click(); await page.waitForTimeout(3500); }
  const server = await page.evaluate(async () => {
    const r=await fetch('/api/v1/notifications/settings',{credentials:'include'});
    return { s:r.status, body:(await r.text()).slice(0,200) }; });
  return { before, afterClick, savedVia: saved, requests: net, serverSettings: server };
};
