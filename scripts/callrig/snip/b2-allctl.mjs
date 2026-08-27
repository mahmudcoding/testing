export default async ({ page }) => {
  return await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); if(r.width===0||r.height===0) return false;
      let n=el,o=1; while(n&&n!==document.documentElement){o*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}
      return o>0.05; };
    const all = [...document.querySelectorAll('button,[role="button"]')].filter(v)
      .map(b => ((b.getAttribute('aria-label')||'') + '|' + (b.innerText||'')).replace(/\s+/g,' ').trim())
      .map(s => s.replace(/^\|/,'').replace(/\|$/,'').slice(0,40))
      .filter(Boolean);
    const uniq = [...new Set(all)];
    return { total: all.length, unique: uniq.length, controls: uniq,
             hasLeaveCall: uniq.some(s => /leave call/i.test(s)),
             hasLeaveRoom: uniq.some(s => /leave (side )?room/i.test(s)) };
  });
};
