export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/notifications',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  return await page.evaluate(()=>{
    const m=document.querySelector('main');
    return {text:(m?m.innerText:'').replace(/\n+/g,' | ').slice(0,900),
      switches:[...document.querySelectorAll('[role="switch"],input[type=checkbox]')].map(e=>{
        let n=e,ctx='';
        for(let k=0;k<6&&n;k++,n=n.parentElement){const t=(n.innerText||'').replace(/\n+/g,' ').trim(); if(t&&t.length<90){ctx=t;break;}}
        return {checked:e.getAttribute('aria-checked')||String(e.checked), ctx:ctx.slice(0,70)};
      })};
  });
};
