export default async ({page}) => {
  const reqs=[];
  const onReq=r=>{ const u=r.url(); if(u.includes('/api/v1/') && r.method()!=='GET')
    reqs.push({m:r.method(), u:u.split('/api/v1')[1].slice(0,60), body:(r.postData()||'').slice(0,80)}); };
  page.on('request', onReq);
  const sel='button[aria-label="Mute notifications"], button[aria-label="Unmute notifications"]';
  const btn=page.locator(sel).first();
  const box=await btn.boundingBox();
  await btn.click();
  const samples=[];
  for (let i=0;i<10;i++){ await page.waitForTimeout(400);
    samples.push(await page.evaluate((s)=>{
      const b=document.querySelector(s);
      const menu=[...document.querySelectorAll('[role="menuitem"],[role="dialog"] button')]
        .filter(e=>e.getBoundingClientRect().height>0).map(e=>e.textContent.trim().slice(0,26));
      return {label:b&&b.getAttribute('aria-label'), pressed:b&&b.getAttribute('aria-pressed'), menu};
    }, sel));
  }
  page.off('request', onReq);
  return {box:!!box, reqs, first:samples[0], last:samples.at(-1),
    menuSeen:[...new Set(samples.flatMap(s=>s.menu))]};
};
