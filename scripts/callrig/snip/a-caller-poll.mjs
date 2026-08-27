export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{const u=r.url(); const m=r.request().method(); if(/\/api\/v1\/meeting/.test(u)&&m!=='GET'){let b='';try{b=(await r.text()).slice(0,150);}catch(e){} net.push(`${m} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/d/C4OS3QRHTP93TJV', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const probe = () => {
    const vis = el => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el);
      return r.width>2 && r.height>2 && s.visibility!=='hidden' && s.display!=='none' && Number(s.opacity)>0.01; };
    const ov = [...document.querySelectorAll('body *')].filter(e=>{
      const s = getComputedStyle(e);
      return (s.position==='fixed') && vis(e) && Number(s.zIndex||0) > 5 && (e.innerText||'').trim().length>0;
    }).map(e=>(e.getAttribute('data-testid')||e.tagName)+':'+(e.innerText||'').replace(/\n+/g,' ').slice(0,60));
    const ring = [...document.querySelectorAll('body *')].filter(e=>vis(e) && /Calling|Ringing|Cancel call/i.test(e.innerText||'') && (e.innerText||'').length<200)
      .map(e=>(e.getAttribute('data-testid')||e.tagName)+':'+(e.innerText||'').replace(/\n+/g,' ').slice(0,60));
    return {u: location.pathname, ov: ov.join(' ~~ ').slice(0,220), ring: ring.slice(0,3).join(' | ').slice(0,180)};
  };
  const pre = await page.evaluate(probe);
  const t0 = Date.now();
  await page.locator('button[aria-label="Start call"]').first().click();
  const frames=[];
  for (let i=0;i<90;i++) { frames.push({ms: Date.now()-t0, ...(await page.evaluate(probe))}); await page.waitForTimeout(300); }
  const trail=[]; let last=null;
  for (const x of frames) { const k = x.u+'|'+x.ov+'|'+x.ring; if (k!==last) { trail.push(x); last=k; } }
  return {pre, clickedAt: new Date(t0).toISOString(), frames: frames.length, trail: trail.slice(0,20), net};
};
