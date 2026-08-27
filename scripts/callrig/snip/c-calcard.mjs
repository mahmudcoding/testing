export default async ({page}) => {
  const WS='W4QCF1XTURESO01'; const TITLE=process.env.QA_TITLE||'QA-C-SCHED-1';
  await page.goto(`https://airion-cargo.store/w/${WS}/calendar`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(/calendar|scheduled/i.test(u)&&r.request().method()==='GET'){ let b=''; try{b=(await r.text()).slice(0,160);}catch(e){} net.push({s:r.status(), u:u.replace('https://airion-cargo.store','').slice(0,70), b}); }});
  const chip = page.locator('button[data-testid="calendar-event-chip"]').filter({hasText:TITLE}).first();
  const n = await chip.count();
  if (!n) return {err:'no chip', txt: await page.evaluate(()=>(document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,400))};
  await chip.scrollIntoViewIfNeeded();
  await chip.click();
  await page.waitForTimeout(3500);
  const card = await page.evaluate(()=>{const d=[...document.querySelectorAll('[role="dialog"]')].filter(e=>e.getClientRects().length).pop();
    return d? {t:(d.innerText||'').replace(/\n+/g,' | ').slice(0,500), btns:[...d.querySelectorAll('button')].map(b=>((b.getAttribute('aria-label')||b.textContent||'').trim()+(b.disabled?'[dis]':'')).slice(0,30)).filter(Boolean).slice(0,12)}:null;});
  const api = await page.evaluate(async ()=>{
    const ev=(location.search.match(/event=([^&]+)/)||[])[1];
    return {ev};
  });
  return {card, api, net: net.slice(0,6)};
};
