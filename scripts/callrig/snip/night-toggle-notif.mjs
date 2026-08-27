export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/notifications',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('notification')&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,200);}catch(e){} net.push(`${r.request().method()} ${r.status()} :: ${b}`);}});
  const res=await page.evaluate(()=>{
    const sws=[...document.querySelectorAll('[role="switch"]')];
    for (const s of sws){
      let n=s,ctx='';
      for(let k=0;k<6&&n;k++,n=n.parentElement){const t=(n.innerText||'').replace(/\n+/g,' ').trim(); if(t&&t.length<90){ctx=t;break;}}
      if(/In-app notifications/i.test(ctx)){ s.setAttribute('data-qa-sw','1'); return {found:ctx.slice(0,60), before:s.getAttribute('aria-checked')}; }
    }
    return null;
  });
  if(!res) return {err:'switch not found'};
  await page.click('[data-qa-sw="1"]');
  await page.waitForTimeout(3000);
  const after=await page.evaluate(()=>document.querySelector('[data-qa-sw="1"]').getAttribute('aria-checked'));
  return {...res, after, net};
};
