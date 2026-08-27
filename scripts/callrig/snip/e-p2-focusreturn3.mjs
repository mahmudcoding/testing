import {WS, BASE} from './e-p2-helpers.mjs';
const act = () => { const e=document.activeElement;
  return e? {tag:e.tagName, label:(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,26)}:null; };
async function trial(page, sel, closeBy){
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const op=page.locator(sel).first();
  const openerLabel=await op.getAttribute('aria-label');
  await op.click(); await page.waitForTimeout(2500);
  if(closeBy==='escape') await page.keyboard.press('Escape');
  else {
    const c=page.locator('[aria-label^="Close"]').first();
    if(await c.count()) await c.click(); else await page.keyboard.press('Escape');
  }
  await page.waitForTimeout(1800);
  const afterClose=await page.evaluate(act);
  await page.keyboard.press('Tab'); await page.waitForTimeout(700);
  const next=await page.evaluate(act);
  return {opener:openerLabel, closeBy, afterClose, nextTabStop:next,
    returned: !!afterClose && afterClose.label===openerLabel,
    thrownToTop: !!next && /Skip to content/i.test(next.label||'')};
}
export default async ({page}) => ({
  searchEsc1:  await trial(page,'[aria-label="Search QA Workspace E"]','escape'),
  searchEsc2:  await trial(page,'[aria-label="Search QA Workspace E"]','escape'),
  searchClose: await trial(page,'[aria-label="Search QA Workspace E"]','close'),
  bellEsc:     await trial(page,'[aria-label^="Notifications"]','escape'),
  archivedEsc: await trial(page,'[aria-label="Open archived channels"]','escape'),
});
