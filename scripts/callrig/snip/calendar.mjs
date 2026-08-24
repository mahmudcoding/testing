export default async ({page}) => {
  const netlog=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/calendar')){let b='';try{b=(await r.text()).slice(0,200);}catch(e){} netlog.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','').slice(0,90)} :: ${b}`);}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calendar',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const ui = await page.evaluate(()=>({
    url: location.href,
    text: (document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,600),
    hasScheduled: /QA Scheduled Call/.test(document.body.innerText)
  }));
  return {ui, net: netlog.slice(-3)};
};
