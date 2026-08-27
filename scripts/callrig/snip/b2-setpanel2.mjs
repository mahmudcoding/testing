export default async ({ page }) => {
  await page.evaluate(() => { const b=document.querySelector('[data-testid="call-controls-settings-toggle"]'); if (b) b.click(); });
  await page.waitForTimeout(2500);
  return await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); if(r.width===0||r.height===0) return false;
      let n=el,o=1; while(n&&n!==document.documentElement){o*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}
      return o>0.05; };
    const ctl = [...document.querySelectorAll('button,input,select,[role="switch"],[role="checkbox"],[role="radio"]')].filter(v)
      .map(e=>({ tag:e.tagName, type:e.getAttribute('type'), role:e.getAttribute('role'),
                 tid:e.getAttribute('data-testid'),
                 label:(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,42),
                 state:e.getAttribute('aria-checked')||e.getAttribute('data-state')||(e.checked!==undefined?String(e.checked):null) }))
      .filter(e=>e.label||e.tid);
    return { count: ctl.length, controls: ctl.filter(c=>/mute|camera|video|mic|device|join/i.test((c.label||'')+' '+(c.tid||''))) };
  });
};
