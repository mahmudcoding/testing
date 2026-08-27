const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const net=[];
  page.on('response', async r => { if(r.request().method()==='GET') return;
    const u=r.url().replace(/^https?:\/\/[^/]+/,''); if(!/\/api\/v1\//.test(u)) return;
    let b=''; try{b=(await r.text()).slice(0,180);}catch{}
    net.push(`${r.request().method()} ${u.slice(0,42)} -> ${r.status()} ${b.replace(/\s+/g,' ')}`); });
  await page.goto(`https://airion-cargo.store/w/${W}/settings/security`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2800);
  const snap=()=>page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const t=(main.innerText||'').replace(/\\s+/g,' '); const i=t.lastIndexOf('›');
    return { len:t.length, tail:(i>=0?t.slice(i+1):t).trim().slice(-320),
      inputs:[...main.querySelectorAll('input')].filter(vis)
        .map(e=>({ph:e.getAttribute('placeholder')||'', type:e.getAttribute('type')||'', v:String(e.value||'').slice(0,10),
                  y:Math.round(e.getBoundingClientRect().top)})),
      buttons:[...main.querySelectorAll('button')].filter(vis).filter(e=>e.getBoundingClientRect().left>300)
        .map(e=>({t:(e.innerText||'').trim().slice(0,26), dis:e.disabled===true})),
      notices:[...document.querySelectorAll('[data-sonner-toast],[role=status],[role=alert],[class*=oast]')].filter(vis)
        .map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim()).filter(Boolean) }; })()`);
  const before = await snap();
  const seen=[];
  const poll=setInterval(async()=>{ try{ seen.push(await snap()); }catch{} }, 350);
  await page.waitForTimeout(500);
  net.length=0;
  await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const b=[...main.querySelectorAll('button')].filter(vis).filter(e=>e.getBoundingClientRect().left>300)
      .filter(e=>/^Enable$/.test((e.innerText||'').trim()));
    if(b.length===1) b[0].click(); })()`);
  await page.waitForTimeout(5000);
  clearInterval(poll);
  const after = await snap();
  return { before:{len:before.len, inputs:before.inputs.length, buttons:before.buttons, tail:before.tail.slice(-180)},
           after:{len:after.len, inputs:after.inputs, buttons:after.buttons, tail:after.tail.slice(-300)},
           lensSeen:[...new Set(seen.map(s=>s.len))],
           noticesEver:[...new Set(seen.flatMap(s=>s.notices))],
           net };
};
