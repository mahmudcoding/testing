export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(/meeting|dm/.test(u)&&r.request().method()==='POST'){let b='';try{b=(await r.text()).slice(0,220);}catch(e){} net.push(`${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/directories?tab=people',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const ok = await page.evaluate(() => {
    const rows=[...document.querySelectorAll('main *')].filter(e=>/QA Bob/.test(e.textContent) && [...e.querySelectorAll('button')].some(b=>/^Call$/.test(b.textContent.trim())));
    const row=rows[rows.length-1]; if(!row) return false;
    [...row.querySelectorAll('button')].find(x=>/^Call$/.test(x.textContent.trim())).setAttribute('data-qa-call','1'); return true;
  });
  if (!ok) return {err:'no call button'};
  const t0 = Date.now();
  await page.click('[data-qa-call="1"]');
  const states=[];
  for (let i=0;i<20;i++) {
    await page.waitForTimeout(5000);
    const s = await page.evaluate(()=>({
      ringing: /Ringing|Calling/i.test(document.body.innerText),
      text: (document.querySelector('[data-testid="call-overlay-expanded"]')||document.body).innerText.replace(/\n+/g,' | ').slice(0,180),
      toasts: [...document.querySelectorAll('[data-sonner-toast],[role="status"],[role="alert"]')].map(x=>x.innerText.replace(/\n+/g,' ').slice(0,90)).filter(Boolean).slice(0,2)}));
    states.push({t: Math.round((Date.now()-t0)/1000), ...s});
    if (!s.ringing && i>1) break;
  }
  return {net, states};
};
