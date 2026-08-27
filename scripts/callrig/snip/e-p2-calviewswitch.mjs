import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  // the page is currently STALE from the last run: it is missing "QA-E late4"
  async function rd(label){
    const r = await page.evaluate(function(){
      return {chips: document.querySelectorAll('button[data-testid="calendar-event-chip"]').length,
              late4: (document.body.innerText||'').includes('QA-E late4')};});
    return {at:label, ...r};
  }
  const out=[await rd('as left (stale?)')];
  for (const label of ['Day','Week','Month']) {
    const b = page.locator('main button').filter({hasText:new RegExp('^'+label+'$')}).first();
    if (await b.count()) { await b.click(); await page.waitForTimeout(3500); out.push(await rd('after '+label)); }
    else out.push({at:'after '+label, note:'button not found'});
  }
  return out;
};
