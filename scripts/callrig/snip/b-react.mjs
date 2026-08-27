export default async ({page}) => {
  const id='C4QBGENERAL0001';
  const sel='div[contenteditable="true"][aria-label="Compose message"]';
  await page.goto(`https://airion-cargo.store/w/W4QBF1XTURESO01/c/${id}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const n0 = await page.evaluate(()=>document.querySelectorAll('[data-message-id]').length);
  // 1. Enter sends in compose mode?
  await page.click(sel);
  await page.keyboard.type('QA-B-4 enter-send-check',{delay:15});
  await page.waitForTimeout(400);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2500);
  const composeEnter = await page.evaluate((s)=>({
    n: document.querySelectorAll('[data-message-id]').length,
    composer: (document.querySelector(s)?.innerText||'').replace(/\s+/g,''),
    last: (()=>{const a=[...document.querySelectorAll('[data-message-id]')].slice(-1)[0];
      return a?a.getAttribute('data-message-id')+'|'+(a.innerText||'').replace(/\s+/g,' ').slice(0,60):null;})()
  }), sel);
  const mid = composeEnter.last ? composeEnter.last.split('|')[0] : null;
  return {n0, composeEnter, mid};
};
