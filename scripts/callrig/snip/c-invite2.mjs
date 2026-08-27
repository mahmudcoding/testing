export default async ({page}) => {
  const out={}; const net=[];
  page.on('response', async r=>{ if(/invite/.test(r.url())){ net.push({m:r.request().method(), s:r.status()}); }});
  await page.keyboard.press('Escape'); await page.waitForTimeout(500);
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button[aria-label="Add to call"]')].find(x=>x.getClientRects().length); if(b)b.click();});
  await page.waitForTimeout(2200);
  const dump = () => page.evaluate(()=>{
    const ds=[...document.querySelectorAll('[role="dialog"]')].filter(e=>e.getClientRects().length); const d=ds[ds.length-1];
    if(!d) return null;
    const rows=[...d.querySelectorAll('li,[role="option"],label')].filter(e=>/QA (Bob|Carol|Dave|Owner|Admin|Guest)/.test(e.textContent||''));
    const seen=new Set(); const u=[];
    for(const r of rows){const k=(r.textContent||'').replace(/\s+/g,' ').trim(); if(seen.has(k))continue; seen.add(k);
      const cb=r.querySelector('input[type=checkbox],[role="checkbox"]');
      u.push({txt:k.slice(0,60), dis: cb?cb.disabled:'nocb', chk: cb?cb.checked:null});}
    return {rows:u, inv:[...d.querySelectorAll('button')].filter(b=>/^Invite/i.test((b.textContent||'').trim())).map(b=>({l:b.textContent.trim(),d:b.disabled}))};
  });
  out.pre = await dump();
  out.tick = await page.evaluate(()=>{
    const ds=[...document.querySelectorAll('[role="dialog"]')].filter(e=>e.getClientRects().length); const d=ds[ds.length-1];
    const el=[...d.querySelectorAll('*')].find(e=>e.children.length===0 && /^QA Carol$/.test((e.textContent||'').trim()));
    if(!el) return 'no carol'; let n=el;
    for(let i=0;i<6&&n;i++){const cb=n.querySelector?n.querySelector('input[type=checkbox]'):null; if(cb){cb.click(); return 'ok';} n=n.parentElement;}
    return 'no cb';
  });
  await page.waitForTimeout(900);
  out.click = await page.evaluate(()=>{
    const ds=[...document.querySelectorAll('[role="dialog"]')].filter(e=>e.getClientRects().length); const d=ds[ds.length-1];
    const b=[...d.querySelectorAll('button')].find(x=>/^Invite/i.test((x.textContent||'').trim()));
    if(!b||b.disabled) return {ok:false,l:b?b.textContent.trim():null}; b.click(); return {ok:true,l:b.textContent.trim()};
  });
  await page.waitForTimeout(2500);
  out.net=net;
  return out;
};
