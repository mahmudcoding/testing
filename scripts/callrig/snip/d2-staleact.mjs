const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const STATE = `() => { const vis=(${VIS});
  const main=document.querySelector('main')||document.body;
  const items=[...main.querySelectorAll('button')].filter(vis)
    .map(b=>(b.innerText||'').trim()).filter(Boolean).filter(t=>!/Filter/.test(t));
  const t=(main.innerText||'');
  return { buttons: items.slice(0,6), rows:(main.querySelectorAll('tr')||[]).length,
           denied:/do not have permission|Admin access required/i.test(t) }; }`;
export default async ({ page }) => {
  // NO navigation: act on the page the browser already has open
  const out = { urlNow: page.url().replace(/^https?:\/\/[^/]+/,''), before: await page.evaluate(`(${STATE})()`) };
  const net=[];
  page.on('response', async r => { const u=r.url(); if(!/audit/i.test(u)) return;
    let b=''; try{b=(await r.text()).slice(0,120);}catch{}
    net.push(`${r.request().method()} ${u.replace(/^https?:\/\/[^/]+/,'').slice(0,50)} -> ${r.status()} ${b.slice(0,80)}`); });
  let notices=[];
  const poll=setInterval(async()=>{ try{ const n=await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')].filter(vis)
      .map(e=>(e.innerText||'').trim()).filter(Boolean); })()`); if(n.length>notices.length) notices=n; }catch{} },250);
  const next = page.locator('button:has-text("Next")').first();
  if (await next.count()) { await next.scrollIntoViewIfNeeded(); await next.click().catch(()=>{}); await page.waitForTimeout(5000); }
  clearInterval(poll);
  out.afterNextClick = await page.evaluate(`(${STATE})()`);
  out.requests = net; out.notices = notices;
  // and after an explicit reload
  await page.reload({ waitUntil:'networkidle' }); await page.waitForTimeout(3000);
  out.afterReload = await page.evaluate(`(${STATE})()`);
  return out;
};
