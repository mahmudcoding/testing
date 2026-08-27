export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(/calendar/.test(u)&&r.request().method()==='POST'){let b='';try{b=(await r.text()).slice(0,140);}catch(e){} net.push(`${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  await page.locator('button:has-text("Schedule meeting")').first().click();
  await page.waitForTimeout(2500);
  const d = page.locator('[role="dialog"]').last();
  await d.locator('input[aria-label="Add title"]').fill('QA-A-RSVP2');
  await d.locator('input[aria-label="Starts time"]').fill('14:00');
  await page.waitForTimeout(500);
  await d.locator('button:has-text("15 min")').first().click();
  await page.waitForTimeout(500);
  const c = d.locator('button:has-text("QA Carol")').first();
  if (await c.count()) { await c.click(); await page.waitForTimeout(700); }
  await d.locator('button:has-text("Schedule meeting")').last().click();
  await page.waitForTimeout(4500);
  return {net};
};
