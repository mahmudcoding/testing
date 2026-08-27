export default async ({page}) => {
  const sel='div[contenteditable="true"][aria-label="Compose message"]';
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/c/C4QBGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  await page.click(sel);
  await page.keyboard.type('@here',{delay:70});
  await page.waitForTimeout(2200);
  const pop = await page.evaluate(()=>({opts:[...document.querySelectorAll('[role=option]')]
    .filter(e=>e.getBoundingClientRect().width>0).map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,44))}));
  if(pop.opts.length){ await page.keyboard.press('Enter'); await page.waitForTimeout(800); }
  await page.keyboard.type(' here-check',{delay:20});
  await page.waitForTimeout(400); await page.keyboard.press('Enter'); await page.waitForTimeout(3500);
  const sent = await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/messaging/channels/C4QBGENERAL0001/messages?limit=3',{credentials:'include'})).json();
    const m=(j?.data?.messages||j?.messages||[])[0];
    return {body:(m?.body||'').slice(0,80)};
  });
  const dom = await page.evaluate(()=>{const a=[...document.querySelectorAll('[data-message-id]')].slice(-1)[0];
    return a?(a.innerText||'').replace(/\s+/g,' ').slice(0,80):null;});
  return {pop, sent, dom};
};
