export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/privacy',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  return await page.evaluate(()=>{
    const m=document.querySelector('main');
    return {text:(m?m.innerText:'').replace(/\n+/g,' | ').slice(-700),
      switches:[...document.querySelectorAll('[role="switch"]')].map(s=>{
        let n=s,ctx='';
        for(let k=0;k<7&&n;k++,n=n.parentElement){const t=(n.innerText||'').replace(/\n+/g,' ').trim(); if(t&&t.length<140){ctx=t;break;}}
        return {checked:s.getAttribute('aria-checked'), ctx:ctx.slice(0,80)};
      }),
      buttons:[...m.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim()).filter(Boolean).slice(0,12)};
  });
};
