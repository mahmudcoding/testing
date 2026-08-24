export default async ({page}) => {
  const name = process.env.QA_NAME || 'QA-CALL';
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/meeting')&&r.request().method()==='POST'){let b='';try{b=(await r.text()).slice(0,200);}catch(e){} net.push(`${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  await page.click('[data-testid="calls-hub-start-now"]');
  await page.waitForTimeout(1500);
  await page.fill('#calls-hub-call-name', name);
  await page.click('[data-testid="calls-start-submit"]');
  await page.waitForTimeout(7000);
  const m = await page.evaluate(async () => { const j = await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json(); return j.meeting? {id:j.meeting.id,name:j.meeting.name,status:j.meeting.status}:j; });
  return {meeting: m, net};
};
