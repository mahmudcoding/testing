export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const info=await page.evaluate(()=>{
    const sws=[...document.querySelectorAll('[role="switch"],input[type=checkbox],button[aria-pressed]')];
    return sws.map((s,i)=>{
      let n=s, ctx='';
      for(let k=0;k<7&&n;k++,n=n.parentElement){ const t=(n.innerText||'').replace(/\n+/g,' | ').trim(); if(t && t.length<200){ ctx=t; break; } }
      s.setAttribute('data-qa-sw', String(i));
      return {i, tag:s.tagName.toLowerCase(), role:s.getAttribute('role'), checked:s.getAttribute('aria-checked')||String(s.checked), ctx:ctx.slice(0,140)};
    });
  });
  const target=info.find(x=>/diagnostic|nerd/i.test(x.ctx));
  if(!target) return {info};
  if (target.checked!=='true'){ await page.click('[data-qa-sw="'+target.i+'"]'); await page.waitForTimeout(2500); }
  const after=await page.evaluate((i)=>{const e=document.querySelector('[data-qa-sw="'+i+'"]');return e.getAttribute('aria-checked')||String(e.checked);}, target.i);
  return {switches: info, toggled: target.i, nowChecked: after};
};
