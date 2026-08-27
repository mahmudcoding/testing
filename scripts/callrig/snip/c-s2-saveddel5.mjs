export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001', id='M4OXFUEHRCHWOUM';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}?m=${id}`);
  await page.waitForTimeout(13000);
  return page.evaluate((id)=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const el=document.querySelector(`[data-message-id="${id}"]`);
    const main=document.querySelector('main');
    const txt=main?(main.innerText||''):'';
    let inView=null;
    if(el){const r=el.getBoundingClientRect();
      inView=r.top>=0 && r.bottom<=innerHeight;}
    return {url:location.pathname+location.search,
      targetNodePresent:!!el,
      targetText:el?(el.innerText||'').replace(/\s+/g,' ').trim().slice(-40):null,
      targetInViewport:inView,
      olderHistoryBanner:/older than loaded history|Message older/i.test(txt),
      anyToast:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(v)
        .map(e=>(e.innerText||'').trim().slice(0,50)).filter(Boolean).slice(0,2)};}, id);
};
