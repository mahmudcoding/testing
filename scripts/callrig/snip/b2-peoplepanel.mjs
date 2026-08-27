export default async ({ page }) => {
  let has = await page.evaluate(() => /IN CALL|Participants/i.test(document.body.innerText||''));
  await page.evaluate(() => { const b=document.querySelector('[data-testid="call-controls-people-toggle"]'); if(b) b.click(); });
  await page.waitForTimeout(2500);
  return await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); if(r.width===0||r.height===0) return false;
      let n=el,o=1; while(n&&n!==document.documentElement){o*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}
      return o>0.05; };
    const all = [...document.querySelectorAll('body *')].filter(v);
    const cand = all.filter(e=>/in call/i.test(e.innerText||'') && (e.innerText||'').length < 400);
    const root = cand.filter(e=>!cand.some(o=>o!==e && e.contains(o)))[0];
    return { panel: root ? root.innerText.replace(/\n+/g,' | ').slice(0,260) : '(not found)',
             tileNames: [...new Set([...document.querySelectorAll('[data-testid*="participant-tile"],[class*="participant-tile"]')]
               .filter(v).map(e=>(e.innerText||'').split('\n')[0].trim()).filter(Boolean))] };
  });
};
