// Watch a message's reactions from before the other side acts.
export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  if(!page.url().includes('/c/'+ch)){ await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`); await page.waitForTimeout(6000); }
  const id=process.env.QA_MSGID;
  await page.evaluate((id)=>{
    window.__rx={s:[],t0:performance.now()};
    clearInterval(window.__rxId);
    window.__rxId=setInterval(()=>{
      const el=document.querySelector(`[data-message-id="${id}"]`);
      const chips=el? [...el.querySelectorAll('button')].filter(b=>{
        const l=b.getAttribute('aria-label')||''; return /react/i.test(l)&&!/Add reaction/.test(l);})
        .map(b=>({l:b.getAttribute('aria-label').slice(0,42), t:(b.textContent||'').trim().slice(0,12),
          pressed:b.getAttribute('aria-pressed')})) : null;
      window.__rx.s.push({t:Math.round(performance.now()-window.__rx.t0), chips,
        vis:document.visibilityState, present:!!el});
    },300);
  }, id);
  return {watching:id, url:page.url()};
};
