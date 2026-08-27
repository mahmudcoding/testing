export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(7000);
  await page.evaluate(()=>{
    window.__lr={s:[],t0:Date.now()};
    clearInterval(window.__lrId);
    window.__lrId=setInterval(()=>{
      const regions=[...document.querySelectorAll('[aria-live],[role="status"],[role="log"]')]
        .map(e=>({live:e.getAttribute('aria-live'), role:e.getAttribute('role'),
          t:(e.textContent||'').trim().slice(0,90)})).filter(x=>x.t);
      if(regions.length) window.__lr.s.push({t:Math.round((Date.now()-window.__lr.t0)/1000), regions});
    },300);
  });
  return {watching:page.url()};
};
