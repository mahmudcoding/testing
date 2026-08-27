const GEN='C4QCGENERAL0001';
export default async ({page}) => {
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(300);
  for (const ch of 'HELLO-TYPING') { await page.keyboard.type(ch); await page.waitForTimeout(200); }
  await page.waitForTimeout(2500);
  const own = await page.evaluate(()=>{
    const st=[...document.querySelectorAll('[role="status"]')].map(e=>({t:(e.textContent||'').trim().slice(0,60),
      h: Math.round(e.getBoundingClientRect().height)}));
    return {statusRows: st, sent: (window.__ws?.sent||[]).map(x=>x.d).slice(-8)};
  });
  return own;
};
