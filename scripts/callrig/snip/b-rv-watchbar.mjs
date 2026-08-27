export default async ({page}) => {
  const N=Number(process.env.QA_N||25), EVERY=Number(process.env.QA_EVERY||3000);
  const samples=[];
  for(let i=0;i<N;i++){
    samples.push(await page.evaluate(()=>{
      const vis=el=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
      const t=document.body.innerText.replace(/\s+/g,' ');
      const join=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Join call$/i.test((x.innerText||'').trim()));
      return {t:new Date().toISOString(), barrier:/password-protected/i.test(t),
        pwEmpty:[...document.querySelectorAll('input[type=password]')].filter(vis).map(i=>i.value).join('|'),
        joinDisabled: join? (join.disabled===true||join.getAttribute('aria-disabled')==='true') : null,
        btns:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim()).filter(Boolean).slice(-4).join(','),
        notices:[...document.querySelectorAll('[data-sonner-toast],[role=status],[role=alert]')].filter(vis).map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean).join('|'),
        vis:document.visibilityState};
    }));
    if(i<N-1) await page.waitForTimeout(EVERY);
  }
  const key=s=>JSON.stringify([s.barrier,s.pwEmpty,s.joinDisabled,s.btns,s.notices]);
  const distinct=[...new Set(samples.map(key))];
  return {n:samples.length, spanSec:Math.round((Date.parse(samples[samples.length-1].t)-Date.parse(samples[0].t))/1000),
          distinctStates:distinct.length, first:samples[0], last:samples[samples.length-1]};
};
