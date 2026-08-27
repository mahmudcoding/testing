const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const SW = `() => { const vis=(${VIS});
  return [...document.querySelectorAll('main [role=switch]')].filter(vis).map(e=>{ let n=e.parentElement,box=null;
    for(let k=0;k<6&&n;k++){ if(n.querySelectorAll('[role=switch]').length===1) box=n; else break; n=n.parentElement; }
    return { label:((box?box.innerText:'')||'').split('\\n')[0].slice(0,40), checked:e.getAttribute('aria-checked') }; }); }`;
export default async ({ page }) => {
  const net=[];
  page.on('response', async r => { if(r.request().method()==='GET') return; const u=r.url();
    if(!/notification/i.test(u)) return; let b=''; try{b=await r.text();}catch{}
    net.push({ m:r.request().method(), u:u.replace(/^https?:\/\/[^/]+/,'').slice(0,44), s:r.status(),
               req:(r.request().postData()||'').slice(0,160), res:b.slice(0,260) }); });
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/notifications', { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const out = { switchesBefore: await page.evaluate(`(${SW})()`) };
  out.serverBefore = await page.evaluate(async () => (await (await fetch('/api/v1/notifications/settings',{credentials:'include'})).text()).slice(0,180));
  const h = await page.evaluateHandle(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('main [role=switch]')].filter(vis).find(e=>{ let n=e.parentElement,box=null;
      for(let k=0;k<6&&n;k++){ if(n.querySelectorAll('[role=switch]').length===1) box=n; else break; n=n.parentElement; }
      return ((box?box.innerText:'')||'').includes('In-app notifications'); }); })()`);
  const el=h.asElement(); await el.scrollIntoViewIfNeeded(); await el.click(); await page.waitForTimeout(1000);
  let notices=[], inline=[];
  const poll=setInterval(async()=>{ try{
    const n=await page.evaluate(`(() => { const vis=(${VIS});
      return [...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')].filter(vis)
        .map(e=>(e.innerText||'').trim()).filter(Boolean); })()`);
    if(n.length>notices.length) notices=n;
    const l=await page.evaluate(`(() => { const vis=(${VIS});
      return [...document.querySelectorAll('main *')].filter(e=>e.children.length===0).filter(vis)
        .map(e=>(e.innerText||'').trim()).filter(t=>t.length<90 && /error|failed|could not|try again|unable|saved|problem/i.test(t)); })()`);
    if(l.length>inline.length) inline=l;
  }catch{} },250);
  net.length=0;
  const save = page.locator('button').filter({hasText:/^Save/}).first();
  if (await save.count()) { await save.scrollIntoViewIfNeeded(); await save.click(); await page.waitForTimeout(6000); }
  clearInterval(poll);
  out.saveRequests = net; out.toasts = notices; out.inline = inline;
  out.switchesAfterSave = await page.evaluate(`(${SW})()`);
  out.saveBarStillPresent = await page.locator('button').filter({hasText:/^Save/}).count() > 0;
  await page.reload({ waitUntil:'networkidle' }); await page.waitForTimeout(3000);
  out.switchesAfterReload = await page.evaluate(`(${SW})()`);
  out.serverAfter = await page.evaluate(async () => (await (await fetch('/api/v1/notifications/settings',{credentials:'include'})).text()).slice(0,180));
  return out;
};
