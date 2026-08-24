export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('calendar')&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,250);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calendar',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const btns = await page.evaluate(()=>[...document.querySelectorAll('main button, header button')].map(b=>`${(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,30)}#${b.getAttribute('data-testid')||'-'}`).filter(x=>!/^#-$/.test(x)).slice(0,25));
  // PATCH an existing plain meeting to recurring
  const patch = await page.evaluate(async () => {
    const r = await fetch('/api/v1/calendar/meetings/S4OTNGGENROPQMQ',{method:'PATCH',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({recurrence:{frequency:'weekly',interval_count:1,days_of_week:[1]}})});
    return r.status+' :: '+(await r.text()).slice(0,220);
  });
  return {btns, patchExistingToRecurring: patch, net};
};
