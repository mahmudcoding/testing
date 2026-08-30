export default async ({page}) => {
  const act=process.env.QA_ACT||'Reject';
  const out={};
  const t = page.locator('[data-testid="call-controls-people-toggle"]').first();
  if (await t.getAttribute('aria-pressed')!=='true'){ const b=await t.boundingBox(); await page.mouse.click(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(2500); }
  const btn = page.locator(`button[aria-label="${act} Screen share for QA Bob"]`).first();
  out.found = await btn.count();
  if(!out.found){ out.btns = await page.evaluate(()=>[...document.querySelectorAll('[data-testid="call-side-panel-slot"] button')].map(b=>b.getAttribute('aria-label')||b.innerText.trim())); return out; }
  const box = await btn.boundingBox();
  out.clickAt = Date.now();
  await page.mouse.click(box.x+box.width/2, box.y+box.height/2);
  await page.waitForTimeout(4000);
  out.panelAfter = await page.evaluate(()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return p?(p.innerText||'').replace(/\s+/g,' ').slice(0,300):null;});
  return out;
};
