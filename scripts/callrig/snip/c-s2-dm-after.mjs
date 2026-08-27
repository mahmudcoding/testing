const WS='W4QCF1XTURESO01', DM='C4OVEWOTJW1AA86';
export default async ({page}) => {
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.keyboard.type('QA-S2-DM-AFTERCLEAR');
  await page.keyboard.press('Enter'); await page.waitForTimeout(2800);
  return await page.evaluate(async (dm)=>{
    const r=await fetch(`/api/v1/messaging/channels/${dm}/messages?limit=20`,{credentials:'include'});
    const j=await r.json(); const list=(j.messages||j.data||[]);
    return {apiCount:list.length, bodies:list.map(m=>m.body).slice(0,5),
      domCount:document.querySelectorAll('[data-message-id]').length,
      domTexts:[...document.querySelectorAll('[data-message-id]')].map(m=>m.innerText.replace(/\n+/g,' ').slice(0,40))};
  }, DM);
};
