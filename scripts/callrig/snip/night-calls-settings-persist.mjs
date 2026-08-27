export default async ({page}) => {
  const label=process.env.QA_LABEL||'Show call diagnostics';
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const net=[];
  page.on('response', async r=>{ if(r.request().method()!=='GET' && !r.url().includes('/api/rum')){ let b=''; try{b=(await r.text()).slice(0,150);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${r.url().replace('https://airion-cargo.store','')} :: ${b}`);} });
  const before=await page.evaluate((label)=>{
    const sws=[...document.querySelectorAll('[role="switch"]')];
    for (const s of sws){ let n=s,ctx='';
      for(let k=0;k<7&&n;k++,n=n.parentElement){const t=(n.innerText||'').replace(/\n+/g,' ').trim(); if(t&&t.length<160){ctx=t;break;}}
      if(ctx.includes(label)){ s.setAttribute('data-qa-sw','1'); return {ctx:ctx.slice(0,70), checked:s.getAttribute('aria-checked')}; } }
    return null;
  }, label);
  if(!before) return {err:'not found: '+label, all: await page.evaluate(()=>[...document.querySelectorAll('[role="switch"]')].map(s=>{let n=s,c='';for(let k=0;k<7&&n;k++,n=n.parentElement){const t=(n.innerText||'').replace(/\n+/g,' ').trim();if(t&&t.length<160){c=t;break;}}return c.slice(0,60);}))};
  await page.click('[data-qa-sw="1"]');
  await page.waitForTimeout(3000);
  const afterClick=await page.evaluate(()=>document.querySelector('[data-qa-sw="1"]').getAttribute('aria-checked'));
  const ls=await page.evaluate(()=>localStorage.getItem('aloqa-call-device-prefs'));
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const afterReload=await page.evaluate((label)=>{
    const sws=[...document.querySelectorAll('[role="switch"]')];
    for (const s of sws){ let n=s,ctx='';
      for(let k=0;k<7&&n;k++,n=n.parentElement){const t=(n.innerText||'').replace(/\n+/g,' ').trim(); if(t&&t.length<160){ctx=t;break;}}
      if(ctx.includes(label)) return s.getAttribute('aria-checked'); }
    return null;
  }, label);
  return {label, before, afterClick, afterReload, writes: net, localStorage: (ls||'').slice(0,200)};
};
