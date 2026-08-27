export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const info=await page.evaluate(()=>{
    const sws=[...document.querySelectorAll('[role="switch"]')];
    return sws.map((s,i)=>{
      // nearest heading text above
      let n=s, ctx='';
      for(let k=0;k<6&&n;k++,n=n.parentElement){ const t=(n.innerText||'').replace(/\n+/g,' | ').trim(); if(t && t.length<160){ ctx=t; break; } }
      s.setAttribute('data-qa-sw', String(i));
      return {i, checked:s.getAttribute('aria-checked'), ctx:ctx.slice(0,120)};
    });
  });
  const target=info.find(x=>/diagnostic|nerd/i.test(x.ctx));
  if(!target) return {info, err:'diagnostics switch not identified'};
  if (target.checked!=='true'){ await page.click('[data-qa-sw="'+target.i+'"]'); await page.waitForTimeout(2500); }
  const after=await page.evaluate((i)=>document.querySelector('[data-qa-sw="'+i+'"]').getAttribute('aria-checked'), target.i);
  return {switches: info, toggled: target.i, nowChecked: after};
};
