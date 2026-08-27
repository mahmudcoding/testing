const WS='W4QCF1XTURESO01', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  // repeat in a different channel with a fresh parent
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`,{waitUntil:'load'});
  await page.waitForTimeout(7500);
  const out={};
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.keyboard.type('QA-S2-DT2-PARENT'); await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  const parent = page.locator('[data-message-id]').last();
  const pid = await parent.getAttribute('data-message-id');
  out.pid = pid;
  await parent.hover(); await page.waitForTimeout(800);
  await parent.locator('button[aria-label="Reply"]').first().click({timeout:10000});
  await page.waitForTimeout(3500);
  await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.keyboard.type('QA-S2-DT2-R1'); await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  out.before = await page.evaluate(async (p)=>{
    const r=await fetch(`/api/v1/messaging/messages/${p}/thread?limit=10`,{credentials:'include'});
    const j=await r.json(); return {s:r.status, replies:(j.replies||[]).length};
  }, pid);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  // alice is NOT the owner of qa-general, so she cannot delete there — use Hide? no.
  // delete via API as the author is not allowed either; check what the menu offers
  const p2 = page.locator(`[data-message-id="${pid}"]`).first();
  await p2.scrollIntoViewIfNeeded().catch(()=>{});
  await p2.hover(); await page.waitForTimeout(800);
  await p2.locator('button[aria-label="More actions"]').first().click({timeout:10000});
  await page.waitForTimeout(1200);
  out.menu = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const m=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role="menu"]')].filter(vis).pop();
    return m? [...m.querySelectorAll('button,[role="menuitem"]')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,22)).filter(Boolean):null;
  });
  await page.keyboard.press('Escape'); await page.waitForTimeout(800);
  return out;
};
