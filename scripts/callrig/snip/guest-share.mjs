export default async ({page}) => {
  const state = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||'')==='Share screen');
    return b? {disabled:b.disabled, ariaDisabled:b.getAttribute('aria-disabled'), pressed:b.getAttribute('aria-pressed'),
               cls:b.className.slice(0,120), rect:b.getBoundingClientRect().toJSON(), pe:getComputedStyle(b).pointerEvents, op:getComputedStyle(b).opacity} : 'missing';
  });
  const netlog=[]; const errs=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,200);}catch(e){} netlog.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  page.on('console', m=>{if(m.type()==='error') errs.push(m.text().slice(0,160));});
  const btn = await page.$('button[aria-label="Share screen"]');
  let clickRes='not-clicked';
  if (btn) { try { await btn.click({timeout:6000}); clickRes='clicked'; } catch(e){ clickRes='click-failed: '+String(e).slice(0,80); } }
  await page.waitForTimeout(5000);
  const after = await page.evaluate(()=>({
    text: document.body.innerText.replace(/\n+/g,' | ').slice(0,400),
    toasts: [...document.querySelectorAll('[role="status"],[role="alert"]')].map(e=>e.innerText.trim()).filter(Boolean).slice(0,6),
    shareLabel: (()=>{const b=[...document.querySelectorAll('button')].find(x=>/share/i.test(x.getAttribute('aria-label')||'')); return b?b.getAttribute('aria-label'):null;})(),
    gdm: (window.__gdmCalls||[]).length
  }));
  return {state, clickRes, net: netlog, errs, after};
};
