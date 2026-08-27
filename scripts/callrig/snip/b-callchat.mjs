export default async ({page}) => {
  const out={};
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>x.getAttribute('aria-label')==='Call chat'); if(b) b.click(); });
  await page.waitForTimeout(2500);
  const box = await page.$('div[contenteditable="true"], textarea, input[type=text]');
  out.foundBox = !!box;
  if (box) {
    await box.click();
    await page.keyboard.press('Control+A').catch(()=>{});
    await box.fill?.('').catch(()=>{});
    await page.keyboard.type('QA-DETAIL-1 message for the detail page');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2500);
  }
  out.chatText = await page.evaluate(()=>{ const t=document.body.innerText.replace(/\s+/g,' '); return (t.match(/QA-DETAIL-1.{0,60}/)||[])[0]||null; });
  return out;
};
