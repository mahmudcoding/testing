export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{const u=r.url(); const m=r.request().method(); if(/\/api\/v1\/(meeting|calendar)/.test(u)&&m!=='GET'){let b='';try{b=(await r.text()).slice(0,170);}catch(e){} net.push(`${m} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const title = process.env.QA_TITLE || 'QA-A-SCHED2';
  const card = page.locator('[data-testid="calls-scheduled-today"] li,[data-testid="calls-scheduled-today"] [role="listitem"]').filter({hasText:title}).first();
  const found = await card.count();
  let clicked = null;
  if (found) {
    const b = card.locator('button:has-text("Start call")').first();
    if (await b.count()) { clicked = 'Start call'; await b.click(); }
  }
  await page.waitForTimeout(9000);
  const after = await page.evaluate(()=>({url:location.href, body:document.body.innerText.replace(/\n+/g,' | ').slice(-320)}));
  const cur = await page.evaluate(async ()=>{const j=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json(); return j.meeting?{id:j.meeting.id,name:j.meeting.name,status:j.meeting.status}:j;});
  return {found, clicked, after, cur, net, at: new Date().toISOString()};
};
