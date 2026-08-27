export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/notifications',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const state=await page.evaluate(()=>{
    const sws=[...document.querySelectorAll('[role="switch"]')];
    return sws.map((s,i)=>{
      const id=s.id;
      const lab=id?document.querySelector('label[for="'+CSS.escape(id)+'"]'):null;
      let n=s,ctx='';
      for(let k=0;k<6&&n;k++,n=n.parentElement){const t=(n.innerText||'').replace(/\n+/g,' ').trim(); if(t&&t.length<110){ctx=t;break;}}
      return {i, checked:s.getAttribute('aria-checked'), id,
        ariaLabel:s.getAttribute('aria-label'), ariaLabelledby:s.getAttribute('aria-labelledby'),
        labelFor: lab?lab.innerText.trim().slice(0,45):null, ctx:ctx.slice(0,60)};
    });
  });
  const api=await page.evaluate(async ()=>(await (await fetch('/api/v1/notifications/settings',{credentials:'include'})).text()).slice(0,220));
  return {switches: state, server: api};
};
