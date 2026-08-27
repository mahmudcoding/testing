export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{const u=r.url(); const m=r.request().method(); if(/\/api\/v1\/meeting/.test(u)&&m!=='GET'){let b='';try{b=(await r.text()).slice(0,170);}catch(e){} net.push(`${m} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/d/C4OS3QRHTP93TJV', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const probe = () => {
    const vis = el => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el);
      return r.width>2 && r.height>2 && s.visibility!=='hidden' && s.display!=='none' && Number(s.opacity)>0.01; };
    const st = document.querySelector('[data-testid="outgoing-call-stage"]');
    const btns = st ? [...st.querySelectorAll('button')].map(b=>((b.getAttribute('aria-label')||b.textContent||'').trim()+'#'+(b.getAttribute('data-testid')||'-'))) : [];
    return {u: location.pathname, stage: st? st.innerText.replace(/\n+/g,' | ').slice(0,120) : null, btns,
      dlg: (()=>{const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis).pop(); return d? d.innerText.replace(/\n+/g,' | ').slice(0,220):null;})()};
  };
  await page.locator('button[aria-label="Start call"]').first().click();
  await page.waitForTimeout(5000);
  const ringing = await page.evaluate(probe);
  // press the only control on the outgoing stage
  const leave = page.locator('[data-testid="outgoing-call-stage"] button').last();
  const label = await leave.count() ? (await leave.getAttribute('aria-label')) || (await leave.textContent()) : null;
  if (await leave.count()) await leave.click();
  const frames=[]; const t0=Date.now();
  for (let i=0;i<25;i++) { frames.push({ms:Date.now()-t0, ...(await page.evaluate(probe))}); await page.waitForTimeout(300); }
  const trail=[]; let last=null;
  for (const x of frames) { const k=JSON.stringify([x.u,x.stage,x.btns,x.dlg]); if(k!==last){trail.push(x); last=k;} }
  return {ringing, clickedLabel: label, trail: trail.slice(0,12), net};
};
