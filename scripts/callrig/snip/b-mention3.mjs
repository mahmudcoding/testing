export default async ({page}) => {
  const sel='div[contenteditable="true"][aria-label="Compose message"]';
  const wait=parseInt(process.env.QA_WAIT||'3500',10);
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/c/C4QBGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  await page.click(sel);
  await page.keyboard.type('@qa_b_bo',{delay:70});
  await page.waitForTimeout(wait);
  const popup = await page.evaluate(()=>({n:[...document.querySelectorAll('[role=option]')]
    .filter(e=>e.getBoundingClientRect().width>0).length,
    txt:[...document.querySelectorAll('[role=option]')].map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,30))[0]||null,
    composer:(document.querySelector('div[contenteditable="true"][aria-label="Compose message"]')?.innerText||'').slice(0,40)}));
  if(popup.n) await page.keyboard.press('Enter');
  await page.waitForTimeout(900);
  const afterPick = await page.evaluate((s)=>document.querySelector(s)?.innerText.slice(0,50)||'', sel);
  await page.keyboard.type(' timing-check',{delay:20});
  await page.waitForTimeout(400);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(3000);
  const sent = await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/messaging/channels/C4QBGENERAL0001/messages?limit=3',{credentials:'include'})).json();
    return ((j?.data?.messages||j?.messages||[])[0]?.body||'').slice(0,80);
  });
  return {wait, popup, afterPick:afterPick.replace(/\s+/g,' ').trim(), sent,
          mentionKept: sent.includes('qa') && sent.includes('bob')};
};
