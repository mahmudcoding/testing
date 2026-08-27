export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{const u=r.url(); const m=r.request().method(); if(/calendar|meeting/.test(u)&&m!=='GET'){let b='';try{b=(await r.text()).slice(0,240);}catch(e){} net.push(`${m} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: req=${(r.request().postData()||'').slice(0,220)} :: ${b}`);}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  await page.locator('button:has-text("Schedule meeting")').first().click();
  await page.waitForTimeout(2500);
  const d = page.locator('[role="dialog"]').last();
  await d.locator('input[aria-label="Add title"]').fill(process.env.QA_TITLE || 'QA-A-SCHED');
  await d.locator('input[aria-label="Starts time"]').fill(process.env.QA_TIME || '11:12');
  await page.waitForTimeout(600);
  await d.locator('button:has-text("15 min")').first().click();
  await page.waitForTimeout(600);
  const bob = d.locator('button:has-text("QA Bob")').first();
  if (await bob.count()) { await bob.click(); await page.waitForTimeout(800); }
  const before = await page.evaluate(()=>{const dd=[...document.querySelectorAll('[role="dialog"]')].pop(); return dd?dd.innerText.replace(/\n+/g,' | ').slice(0,300):null;});
  await d.locator('button:has-text("Schedule meeting")').last().click();
  await page.waitForTimeout(5000);
  const after = await page.evaluate(()=>{
    const m=document.querySelector('main')||document.body;
    return {url:location.href, dlg: !!document.querySelector('[role="dialog"]'), text: m.innerText.replace(/\n+/g,' | ').slice(0,600)};
  });
  return {before, after, net};
};
