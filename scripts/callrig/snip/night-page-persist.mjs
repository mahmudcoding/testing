export default async ({page}) => {
  const url=process.env.QA_PAGE, label=process.env.QA_LABEL;
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const net=[];
  page.on('response', async r=>{ if(r.request().method()!=='GET' && !r.url().includes('/api/rum') && !r.url().includes('ws-ticket')){ let b=''; try{b=(await r.text()).slice(0,150);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${r.url().replace('https://airion-cargo.store','')} :: ${b}`);} });
  const find=(label)=>{
    const sws=[...document.querySelectorAll('[role="switch"]')];
    for (const s of sws){ let n=s,ctx='';
      for(let k=0;k<7&&n;k++,n=n.parentElement){const t=(n.innerText||'').replace(/\n+/g,' ').trim(); if(t&&t.length<160){ctx=t;break;}}
      if(ctx.includes(label)) return s; }
    return null;
  };
  const before=await page.evaluate(({label,fn})=>{ const f=new Function('label','return ('+fn+')(label)'); const s=f(label); if(!s) return null; s.setAttribute('data-qa-sw','1'); return s.getAttribute('aria-checked'); }, {label, fn:find.toString()}).catch(()=>null);
  if(before===null){
    // fallback without new Function (CSP): inline the search
    const b2=await page.evaluate((label)=>{
      const sws=[...document.querySelectorAll('[role="switch"]')];
      for (const s of sws){ let n=s,ctx='';
        for(let k=0;k<7&&n;k++,n=n.parentElement){const t=(n.innerText||'').replace(/\n+/g,' ').trim(); if(t&&t.length<160){ctx=t;break;}}
        if(ctx.includes(label)){ s.setAttribute('data-qa-sw','1'); return s.getAttribute('aria-checked'); } }
      return null;
    }, label);
    if(b2===null) return {err:'switch not found: '+label};
    var start=b2;
  } else var start=before;
  await page.click('[data-qa-sw="1"]');
  await page.waitForTimeout(4000);
  const afterClick=await page.evaluate(()=>document.querySelector('[data-qa-sw="1"]').getAttribute('aria-checked'));
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const afterReload=await page.evaluate((label)=>{
    const sws=[...document.querySelectorAll('[role="switch"]')];
    for (const s of sws){ let n=s,ctx='';
      for(let k=0;k<7&&n;k++,n=n.parentElement){const t=(n.innerText||'').replace(/\n+/g,' ').trim(); if(t&&t.length<160){ctx=t;break;}}
      if(ctx.includes(label)) return s.getAttribute('aria-checked'); }
    return null;
  }, label);
  return {label, before:start, afterClick, afterReload, writes:net};
};
