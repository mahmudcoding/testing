export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(7000);
  await page.evaluate(()=>{
    window.__aw={s:[],t0:Date.now()};
    clearInterval(window.__awId);
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    window.__awId=setInterval(()=>{
      const comp=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
      const banner=[...document.querySelectorAll('main *')].filter(e=>e.children.length===0)
        .filter(vis).map(e=>(e.textContent||'').trim())
        .filter(t=>/archiv|read-only|read only/i.test(t)&&t.length<70);
      window.__aw.s.push({t:Math.round((Date.now()-window.__aw.t0)/1000),
        composer: !!comp, composerEditable: comp? comp.getAttribute('contenteditable'):null,
        banner, vis:document.visibilityState,
        notices:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis)
          .map(x=>x.textContent.trim().slice(0,44))});
    },1000);
  });
  return {watching:page.url()};
};
