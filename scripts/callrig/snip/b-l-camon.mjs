import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  const before = await page.evaluate(()=>{
    const q=window.__qa;
    const b=[...document.querySelectorAll('button')].filter(q.vis).find(x=>/^Turn camera (on|off)$/i.test(q.nameOf(x).trim()));
    return b?q.nameOf(b).trim():null;
  });
  if(before==='Turn camera on'){
    await page.evaluate(()=>window.__qa.clickDeepest(/^Turn camera on$/i));
    await page.waitForTimeout(3000);
  }
  const after = await page.evaluate(()=>{
    const q=window.__qa;
    const b=[...document.querySelectorAll('button')].filter(q.vis).find(x=>/^Turn camera (on|off)$/i.test(q.nameOf(x).trim()));
    const se=[]; for(const pc of (window.__pcs||[])){ if(pc.connectionState==='closed') continue;
      for(const t of pc.getSenders()) if(t.track) se.push(t.track.kind+':'+t.track.enabled); }
    return {label:b?q.nameOf(b).trim():null, senders:se};
  });
  return {before, after};
};
