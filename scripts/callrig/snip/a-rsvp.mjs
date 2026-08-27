export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{const u=r.url(); const m=r.request().method(); if(/calendar|rsvp|respond|attend/i.test(u)&&m!=='GET'){let b='';try{b=(await r.text()).slice(0,200);}catch(e){} net.push(`${m} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: req=${(r.request().postData()||'').slice(0,90)} :: ${b}`);}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  const chip = page.locator('button[data-testid="calendar-event-chip"]').filter({hasText: process.env.QA_TITLE||'QA-A-SCHED3'}).first();
  if (!(await chip.count())) return {err:'no chip'};
  await chip.click(); await page.waitForTimeout(3000);
  const read = () => { const d=[...document.querySelectorAll('[role="dialog"]')].pop();
    return d? {t:d.innerText.replace(/\n+/g,' | ').slice(0,520), btns:[...d.querySelectorAll('button,a')].map(b=>((b.getAttribute('aria-label')||b.textContent||'').trim()+(b.disabled?'[dis]':'')+'/'+(b.getAttribute('aria-pressed')||'-')).slice(0,34)).filter(Boolean)} : {none:true}; };
  const before = await page.evaluate(read);
  const ans = process.env.QA_ANSWER;
  if (ans) {
    const b = page.locator('[role="dialog"] button').filter({hasText: new RegExp('^'+ans+'$')}).first();
    if (await b.count()) { await b.click(); await page.waitForTimeout(3500); }
  }
  const after = await page.evaluate(read);
  return {before, after, net, now:new Date().toISOString()};
};
