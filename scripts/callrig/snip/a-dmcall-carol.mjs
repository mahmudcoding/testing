export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{const u=r.url(); const m=r.request().method(); if(/\/api\/v1\/meeting/.test(u)&&m!=='GET'){let b='';try{b=(await r.text()).slice(0,140);}catch(e){} net.push(`${m} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  const dm = page.locator('nav button:has-text("QA Carol"), aside button:has-text("QA Carol")').first();
  if (!(await dm.count())) return {err:'no carol dm'};
  await dm.click(); await page.waitForTimeout(3500);
  const sc = page.locator('button[aria-label="Start call"]').first();
  if (!(await sc.count())) return {err:'no start call', url: page.url()};
  await sc.click();
  await page.waitForTimeout(5000);
  const ringing = await page.evaluate(() => {
    const st = document.querySelector('[data-testid="outgoing-call-stage"]');
    return {url: location.href, stage: st? st.innerText.replace(/\n+/g,' | ').slice(0,140):null,
      btns: st? [...st.querySelectorAll('button')].map(b=>((b.getAttribute('aria-label')||b.textContent||'').trim()+'#'+(b.getAttribute('data-testid')||'-'))):[]};
  });
  const leave = page.locator('[data-testid="call-controls-leave"]').first();
  if (await leave.count()) await leave.click();
  await page.waitForTimeout(3500);
  const after = await page.evaluate(()=>({url: location.href, stage: !!document.querySelector('[data-testid="outgoing-call-stage"]')}));
  return {ringing, after, net};
};
