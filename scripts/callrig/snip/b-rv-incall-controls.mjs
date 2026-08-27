export default async ({page}) => {
  return await page.evaluate(()=>{
    const vis = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    return {
      url: location.href,
      btns: [...document.querySelectorAll('button,a[href]')].filter(vis).map(b=>({t:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,40), al:b.getAttribute('aria-label'), tid:b.getAttribute('data-testid')})).filter(b=>b.t||b.al||b.tid)
    };
  });
};
