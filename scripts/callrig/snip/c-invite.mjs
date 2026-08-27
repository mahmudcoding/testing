export default async ({page}) => {
  const out={}; const net=[];
  page.on('response', async r=>{ if(/invite/.test(r.url())){ net.push({m:r.request().method(), s:r.status(), u:r.url().replace('https://airion-cargo.store','')}); }});
  await page.keyboard.press('Escape'); await page.waitForTimeout(600);
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button[aria-label="Add to call"]')].find(x=>x.getClientRects().length); if(b)b.click();});
  await page.waitForTimeout(2500);
  const dump = () => page.evaluate(()=>{
    const ds=[...document.querySelectorAll('[role="dialog"]')].filter(e=>e.getClientRects().length); const d=ds[ds.length-1];
    if(!d) return null;
    const rows=[...d.querySelectorAll('li,[role="option"],label,div')].filter(e=>/QA (Bob|Carol|Dave|Owner|Admin|Guest|Outsider)/.test(e.textContent||'') && e.querySelectorAll('input,[role="checkbox"]').length<=2 && (e.textContent||'').length<120);
    const seen=new Set(); const uniq=[];
    for(const r of rows){ const k=(r.textContent||'').replace(/\s+/g,' ').trim(); if(seen.has(k))continue; seen.add(k);
      const cb=r.querySelector('input[type=checkbox],[role="checkbox"]');
      uniq.push({txt:k.slice(0,60), cbDisabled: cb? (cb.disabled ?? cb.getAttribute('aria-disabled')) : 'nocb', cbChecked: cb? (cb.checked ?? cb.getAttribute('aria-checked')) : null}); }
    return {title:(d.querySelector('h2')||{}).textContent, rows:uniq.slice(0,10),
      btns:[...d.querySelectorAll('button')].filter(b=>b.getClientRects().length).map(b=>({l:(b.getAttribute('aria-label')||b.textContent||'').replace(/\s+/g,' ').trim().slice(0,30), d:b.disabled}))};
  });
  out.before = await dump();
  // tick carol
  out.ticked = await page.evaluate(()=>{
    const ds=[...document.querySelectorAll('[role="dialog"]')].filter(e=>e.getClientRects().length); const d=ds[ds.length-1];
    const els=[...d.querySelectorAll('*')].filter(e=>e.children.length===0 && /^QA Carol$/.test((e.textContent||'').trim()));
    if(!els.length) return 'no carol';
    let n=els[0]; for(let i=0;i<6&&n;i++){ const cb=n.querySelector? n.querySelector('input[type=checkbox],[role="checkbox"],button') : null;
      if(cb){ cb.click(); return 'clicked:'+(cb.tagName); } n=n.parentElement; }
    els[0].click(); return 'clicked-label';
  });
  await page.waitForTimeout(1200);
  out.afterTick = await dump();
  out.inviteClicked = await page.evaluate(()=>{
    const ds=[...document.querySelectorAll('[role="dialog"]')].filter(e=>e.getClientRects().length); const d=ds[ds.length-1];
    const b=[...d.querySelectorAll('button')].find(x=>/^Invite/i.test((x.textContent||'').trim()));
    if(!b||b.disabled) return {ok:false, label:b?b.textContent.trim():null, disabled:b?b.disabled:null};
    b.click(); return {ok:true, label:b.textContent.trim()};
  });
  await page.waitForTimeout(3000);
  out.net = net;
  out.afterInvite = await dump();
  return out;
};
