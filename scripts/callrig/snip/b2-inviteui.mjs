export default async ({ page }) => {
  return await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); if(r.width===0||r.height===0) return false;
      let n=el,o=1; while(n&&n!==document.documentElement){o*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}
      return o>0.05; };
    const ctl = [...document.querySelectorAll('button,[role="button"]')].filter(v)
      .map(b=>({ tid:b.getAttribute('data-testid'),
                 al:(b.getAttribute('aria-label')||'').slice(0,30),
                 t:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,24) }))
      .filter(b=>b.tid||b.al||b.t);
    const toastish = ctl.filter(b=>/incoming|call|accept|decline|join|dismiss/i.test((b.tid||'')+(b.al||'')+b.t));
    const layer = document.querySelector('[data-testid="incoming-call-priority-layer"]');
    return { toastText: layer ? layer.innerText.replace(/\n+/g,' | ').slice(0,160) : null,
             layerButtons: layer ? [...layer.querySelectorAll('button')].filter(v)
               .map(b=>({tid:b.getAttribute('data-testid'), al:b.getAttribute('aria-label'),
                         t:(b.innerText||'').trim().slice(0,20)})) : null,
             candidates: toastish.slice(0,12) };
  });
};
