export default async ({page}) => {
  const name = 'Q'.repeat(Number(process.env.QA_LEN||300));
  const netlog=[];
  page.on('response', async r=>{const u=r.url(); if(u.endsWith('/api/v1/meeting')&&r.request().method()==='POST'){let b='';try{b=(await r.text()).slice(0,200);}catch(e){} netlog.push(`${r.status()} :: ${b}`);}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  await page.click('[data-testid="calls-hub-start-now"]');
  await page.waitForTimeout(1200);
  await page.fill('#calls-hub-call-name', name);
  const inputVal = await page.$eval('#calls-hub-call-name', e=>({len:e.value.length, maxLength:e.maxLength}));
  await page.click('[data-testid="calls-start-submit"]');
  await page.waitForTimeout(7000);
  const ui = await page.evaluate(()=>{
    const h=document.querySelector('[data-testid="call-top-bar"] h2') || document.querySelector('[data-testid="call-overlay-expanded"] h2');
    if(!h) return {noHeading:true, body: document.body.innerText.replace(/\n+/g,' | ').slice(0,200)};
    const r=h.getBoundingClientRect(); const cs=getComputedStyle(h);
    return {len:h.textContent.length, sw:h.scrollWidth, cw:h.clientWidth, clipped:h.scrollWidth>h.clientWidth+1,
            overflow:cs.overflow, textOverflow:cs.textOverflow, width:Math.round(r.width),
            docOverflow: document.documentElement.scrollWidth>innerWidth};
  });
  return {sentLen:name.length, inputVal, net: netlog, ui};
};
