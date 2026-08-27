import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('button[aria-label="Open archived channels"]').first().click();
  await page.waitForTimeout(1800);
  const measure = `(() => {
    const dlg=[...document.querySelectorAll('[role=dialog]')].pop();
    if(!dlg) return {noDlg:true};
    const btns=[...dlg.querySelectorAll('button')];
    return btns.map(b=>{ const r=b.getBoundingClientRect(); const cs=getComputedStyle(b);
      const h=document.elementFromPoint(r.x+r.width/2, r.y+r.height/2);
      let n=b,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}
      return {t:(b.getAttribute('aria-label')||b.textContent||'').replace(/\\s+/g,' ').trim().slice(0,34),
        rect:Math.round(r.x)+','+Math.round(r.y)+' '+Math.round(r.width)+'x'+Math.round(r.height),
        selfOpacity:cs.opacity, chainOpacity:+op.toFixed(3), pe:cs.pointerEvents, disabled:b.disabled,
        hit: h? (h===b||b.contains(h)?'self':h.tagName+'.'+String(h.className||'').slice(0,20)) : 'none'};});
  })()`;
  const before = await page.evaluate(measure);
  // hover the channel row, then re-measure
  const row = page.locator('[role=dialog]').last().locator('text=qa-archived').first();
  try { await row.hover({timeout:5000}); } catch(e) {}
  await page.waitForTimeout(900);
  const afterHover = await page.evaluate(measure);
  return {before, afterHover};
};
