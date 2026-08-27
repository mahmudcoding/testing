import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const snap = `(() => { ${VISFN}
  const dlg=[...document.querySelectorAll('[role=dialog],[role=menu],[data-radix-popper-content-wrapper]')].filter(vis);
  const top = dlg[dlg.length-1] || null;
  return {
    url: location.pathname,
    nDialogs: dlg.length,
    dlgText: top ? (top.innerText||'').replace(/\\n+/g,' | ').slice(0,600) : null,
    dlgCtrls: top ? interactives(top).map(d=>d.label.slice(0,30)+(d.disabled?'[DIS]':'')).join(' | ').slice(0,700) : null,
    mainText: (document.querySelector('main')?.innerText||'').replace(/\\n+/g,' | ').slice(0,400)
  };
})()`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const targets = ['Message requests','Open archived channels','Help & resources','Add channel'];
  for (const t of targets) {
    try {
      const loc = page.locator(`button[aria-label="${t}"]`);
      const n = await loc.count();
      if (!n) { out[t] = {notFound:true}; continue; }
      await loc.first().click();
      await page.waitForTimeout(1600);
      out[t] = await page.evaluate(snap);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(900);
    } catch(e) { out[t] = {err: String(e).replace(/\s+/g,' ').slice(0,160)}; }
  }
  return out;
};
