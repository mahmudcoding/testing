export default async ({page}) => {
  const label=process.env.QA_LABEL||'Mute channel notifications';
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/notifications',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const net=[];
  page.on('response', async r=>{ if(r.request().method()!=='GET' && !r.url().includes('/api/rum')){ let b=''; try{b=(await r.text()).slice(0,200);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${r.url().replace('https://airion-cargo.store','')} :: ${b}`);} });
  const before=await page.evaluate((label)=>{
    const sws=[...document.querySelectorAll('[role="switch"]')];
    for (const s of sws){ let n=s,ctx='';
      for(let k=0;k<6&&n;k++,n=n.parentElement){const t=(n.innerText||'').replace(/\n+/g,' ').trim(); if(t&&t.length<120){ctx=t;break;}}
      if(ctx.includes(label)){ s.setAttribute('data-qa-sw','1'); return s.getAttribute('aria-checked'); } }
    return null;
  }, label);
  if(before===null) return {err:'switch not found: '+label};
  await page.click('[data-qa-sw="1"]');
  await page.waitForTimeout(6000);
  const afterClick=await page.evaluate(()=>document.querySelector('[data-qa-sw="1"]').getAttribute('aria-checked'));
  const api=await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/notifications/settings',{credentials:'include'});
    return (await r.text()).slice(0,220);
  });
  return {label, before, afterClick, writes: net, serverAfter: api};
};
