const WS='W4QCF1XTURESO01', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  if (!page.url().includes(GEN)) { await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`,{waitUntil:'load'}); await page.waitForTimeout(5000); }
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(300);
  // type slowly, like a person
  const out={};
  const t0 = Date.now();
  for (const ch of 'QA-S2-TYPING-PROBE') { await page.keyboard.type(ch); await page.waitForTimeout(180); }
  out.typedMs = Date.now()-t0;
  await page.waitForTimeout(3000);   // keep the draft, do not send — indicator should be up then decay
  out.stillDraft = await page.evaluate(()=>{
    const c=[...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')].pop();
    return c.innerText.replace(/\n/g,'\\n').slice(0,40);
  });
  await page.waitForTimeout(6000);   // let it expire while still holding the text
  return out;
};
