export default async ({page}) => {
  const id='C4QBGENERAL0001';
  const sel='div[contenteditable="true"][aria-label="Compose message"]';
  await page.goto(`https://airion-cargo.store/w/W4QBF1XTURESO01/c/${id}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  await page.click(sel);
  await page.keyboard.type('@qa_b_bo',{delay:60});
  await page.waitForTimeout(2000);
  const pop = await page.evaluate(()=>{
    const opts=[...document.querySelectorAll('[role=option],[role=menuitem],li')]
      .filter(e=>{const r=e.getBoundingClientRect(); return r.width>0&&r.height>0&&(e.innerText||'').trim();})
      .map(e=>({t:(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,40), role:e.getAttribute('role')||e.tagName}));
    return {n:opts.length, opts:opts.slice(0,6)};
  });
  let picked=null;
  if(pop.n){ await page.keyboard.press('Enter'); await page.waitForTimeout(800);
    picked = await page.evaluate((s)=>document.querySelector(s)?.innerText.slice(0,60)||'', sel); }
  await page.keyboard.type(' mention-check',{delay:20});
  await page.waitForTimeout(400);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(3000);
  const sent = await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/messaging/channels/C4QBGENERAL0001/messages?limit=5',{credentials:'include'})).json();
    const arr=(j?.data?.messages||j?.messages||[]);
    const m=arr[0];
    return {id:m?.id, body:(m?.body||'').slice(0,120), mentions:m?.mentions??null};
  });
  const dom = await page.evaluate(()=>{
    const a=[...document.querySelectorAll('[data-message-id]')].slice(-1)[0];
    return a?{text:(a.innerText||'').replace(/\s+/g,' ').slice(0,90),
      mentionEls:[...a.querySelectorAll('[data-mention],[class*=mention],a')].map(e=>(e.innerText||'').slice(0,24))}:null;
  });
  return {pop, picked, sent, dom};
};
