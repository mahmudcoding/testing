export default async ({page}) => {
  const out={};
  const b = page.locator('button[aria-label="Admit QA Bob"]').first();
  out.found = await b.count();
  if (out.found) { await b.click(); await page.waitForTimeout(4000); }
  out.panel = await page.evaluate(()=>{
    const p = document.querySelector('[data-testid="call-side-panel-slot"]');
    return p?(p.innerText||'').replace(/\s+/g,' ').slice(0,400):null;});
  return out;
};
