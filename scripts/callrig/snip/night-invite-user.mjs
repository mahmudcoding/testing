export default async ({page}) => {
  const who=process.env.QA_WHO;
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('invite')){let b='';try{b=(await r.text()).slice(0,250);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  const picked=await page.evaluate((who)=>{
    const ms=[...document.querySelectorAll('[role="dialog"]')].filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded');
    const m=ms[ms.length-1];
    const boxes=[...m.querySelectorAll('input[type=checkbox]')];
    for (const b of boxes){ const lab=b.closest('label'); const txt=lab?lab.innerText.replace(/\n+/g,' ').trim():''; if(txt.includes(who)){ if(!b.checked) b.click(); return txt.slice(0,40); } }
    // fallback: clickable rows
    const rows=[...m.querySelectorAll('button,[role="option"]')].filter(e=>(e.textContent||'').includes(who));
    if(rows.length){ rows[0].click(); return 'row:'+rows[0].textContent.trim().slice(0,30); }
    return null;
  }, who);
  await page.waitForTimeout(800);
  const btnLabel=await page.evaluate(()=>{
    const ms=[...document.querySelectorAll('[role="dialog"]')].filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded');
    const m=ms[ms.length-1];
    const b=[...m.querySelectorAll('button')].find(x=>/^Invite/.test((x.textContent||'').trim()));
    return b?{label:b.textContent.trim(), disabled:b.disabled}:null;
  });
  if (btnLabel && !btnLabel.disabled){
    await page.evaluate(()=>{
      const ms=[...document.querySelectorAll('[role="dialog"]')].filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded');
      const m=ms[ms.length-1];
      const b=[...m.querySelectorAll('button')].find(x=>/^Invite/.test((x.textContent||'').trim()));
      b.click();
    });
    await page.waitForTimeout(4000);
  }
  const toasts=await page.evaluate(()=>[...document.querySelectorAll('[role="status"],[role="alert"]')].map(e=>e.innerText.replace(/\n+/g,' | ').slice(0,160)).filter(Boolean));
  return {picked, inviteButton: btnLabel, net, toasts};
};
