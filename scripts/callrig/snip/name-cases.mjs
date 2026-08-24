export default async ({page}) => {
  const name = process.env.QA_NAME2 ?? '';
  const netlog=[];
  page.on('response', async r=>{const u=r.url(); if(u.endsWith('/api/v1/meeting')&&r.request().method()==='POST'){let b='';try{b=(await r.text()).slice(0,160);}catch(e){} netlog.push(`${r.status()} :: ${b}`);}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  await page.click('[data-testid="calls-hub-start-now"]');
  await page.waitForTimeout(1200);
  if (name) await page.fill('#calls-hub-call-name', name);
  await page.click('[data-testid="calls-start-submit"]');
  await page.waitForTimeout(7000);
  const ui = await page.evaluate(()=>{
    const tb=document.querySelector('[data-testid="call-top-bar"]');
    return {topBar: tb? tb.innerText.replace(/\n+/g,' | ').slice(0,90) : null,
            hasOverlay: !!document.querySelector('[data-testid="call-overlay-expanded"]')};
  });
  const api = await page.evaluate(async()=>{const j=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json(); return j.meeting? JSON.stringify(j.meeting.name) : null;});
  return {sent: JSON.stringify(name), net: netlog, apiName: api, ui};
};
