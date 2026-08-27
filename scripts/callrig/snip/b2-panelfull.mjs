export default async ({ page }) => {
  return await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); if(r.width===0||r.height===0) return false;
      let n=el,o=1; while(n&&n!==document.documentElement){o*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}
      return o>0.05; };
    const all = [...document.querySelectorAll('body *')].filter(v);
    const cand = all.filter(n=>/Participants|IN CALL/i.test(n.textContent||''));
    const root = cand.filter(n=>!cand.some(o=>o!==n && n.contains(o)))[0] || cand[cand.length-1];
    return { panel: root ? root.innerText.replace(/\n+/g,' | ').slice(0,420) : '(none)',
             mentionsBlocked: /blocked|disabled by|host has|muted by/i.test(document.body.innerText) };
  });
};
