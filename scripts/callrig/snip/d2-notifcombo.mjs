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
    net.push(`${r.request().method()} -> ${r.status()} req=${(r.request().postData()||'').slice(0,90)} res=${b.slice(0,120)}`); });
  const flip = async label => { const h=await page.evaluateHandle(`(() => { const vis=(${VIS});
      return [...document.querySelectorAll('main [role=switch]')].filter(vis).find(e=>{ let n=e.parentElement,box=null;
        for(let k=0;k<6&&n;k++){ if(n.querySelectorAll('[role=switch]').length===1) box=n; else break; n=n.parentElement; }
        return ((box?box.innerText:'')||'').includes(${JSON.stringify('')}) && ((box?box.innerText:'')||'').includes(${JSON.stringify(label)}); }); })()`);
    const el=h.asElement(); if(!el) return 'not found';
    await el.scrollIntoViewIfNeeded(); await el.click(); await page.waitForTimeout(800); return 'flipped'; };
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/notifications', { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const out={ start: await page.evaluate(`(${SW})()`) };
  // enable Mute channel notifications AND disable In-app, in one save
  out.flipMute = await flip('Mute channel notifications');
  out.flipInApp = await flip('In-app notifications');
  out.stateBeforeSave = await page.evaluate(`(${SW})()`);
  let notices=[];
  const poll=setInterval(async()=>{ try{ const n=await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')].filter(vis)
      .map(e=>(e.innerText||'').trim()).filter(Boolean); })()`); if(n.length>notices.length) notices=n; }catch{} },250);
  net.length=0;
  const save = page.locator('button').filter({hasText:/^Save/}).first();
  if (await save.count()) { await save.scrollIntoViewIfNeeded(); await save.click(); await page.waitForTimeout(5500); }
  clearInterval(poll);
  out.requests = net; out.toasts = notices;
  await page.reload({ waitUntil:'networkidle' }); await page.waitForTimeout(2800);
  out.afterReload = await page.evaluate(`(${SW})()`);
  out.server = await page.evaluate(async () => (await (await fetch('/api/v1/notifications/settings',{credentials:'include'})).text()).slice(0,180));
  return out;
};
