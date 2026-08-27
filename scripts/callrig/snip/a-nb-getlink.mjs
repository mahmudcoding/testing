import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const b = page.locator('[data-testid="call-controls-add-to-call"]').first();
  if (await b.count()) { await b.click(); await page.waitForTimeout(2500); }
  return await page.evaluate((v)=>{ const vis=eval(v);
    const inp=document.querySelector('[data-testid="guest-links-created-url"]');
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis)
      .find(x=>/Invite to this call/.test(x.innerText||''));
    return {link: inp?inp.value:null,
      dialogTail: d?(d.innerText||'').replace(/\s+/g,' ').slice(-260):null}; }, VIS);
}
