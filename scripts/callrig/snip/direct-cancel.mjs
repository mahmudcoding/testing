export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(/meeting/.test(u)&&r.request().method()==='POST'){let b='';try{b=(await r.text()).slice(0,180);}catch(e){} net.push(`${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/directories?tab=people',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  await page.evaluate(() => {
    const rows=[...document.querySelectorAll('main *')].filter(e=>/QA Carol/.test(e.textContent) && [...e.querySelectorAll('button')].some(b=>/^Call$/.test(b.textContent.trim())));
    const row=rows[rows.length-1];
    [...row.querySelectorAll('button')].find(x=>/^Call$/.test(x.textContent.trim())).setAttribute('data-qa-call','1');
  });
  await page.click('[data-qa-call="1"]');
  await page.waitForTimeout(9000);
  // cancel by leaving
  const lv = page.locator('button[aria-label="Leave call"], [data-testid="call-controls-leave"]').first();
  let left=false;
  if (await lv.count()) { await lv.click(); await page.waitForTimeout(1500);
    const cf = page.locator('[role="dialog"] button, [role="alertdialog"] button', {hasText:/Leave|Confirm|End/}).last();
    if (await cf.count()) await cf.click(); left=true; }
  await page.waitForTimeout(4000);
  return {net, left, body: await page.evaluate(()=>document.body.innerText.replace(/\n+/g,' | ').slice(0,200))};
};
