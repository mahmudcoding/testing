export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(/calendar/.test(u)&&r.request().method()==='POST'){let b='';try{b=(await r.text()).slice(0,120);}catch(e){} net.push(`${r.status()} :: ${b}`);}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  await page.locator('button:has-text("Schedule meeting")').first().click();
  await page.waitForTimeout(2200);
  const d = page.locator('[role="dialog"]').last();
  await d.locator('input[aria-label="Add title"]').fill('QA-A-DEC2');
  await d.locator('input[aria-label="Starts time"]').fill('12:30');
  await page.waitForTimeout(400);
  await d.locator('button:has-text("15 min")').first().click();
  await page.waitForTimeout(400);
  const b = d.locator('button:has-text("QA Bob")').first();
  if (await b.count()) { await b.click(); await page.waitForTimeout(600); }
  await d.locator('button:has-text("Schedule meeting")').last().click();
  await page.waitForTimeout(4000);
  return {net};
};
