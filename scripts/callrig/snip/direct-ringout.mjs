export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(/meeting/.test(u)&&r.request().method()==='POST'){net.push(`${r.status()} ${u.replace('https://airion-cargo.store','')}`);}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/directories?tab=people',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  await page.evaluate(() => {
    const rows=[...document.querySelectorAll('main *')].filter(e=>/QA Bob/.test(e.textContent) && [...e.querySelectorAll('button')].some(b=>/^Call$/.test(b.textContent.trim())));
    [...rows[rows.length-1].querySelectorAll('button')].find(x=>/^Call$/.test(x.textContent.trim())).setAttribute('data-qa-call','1');
  });
  await page.click('[data-qa-call="1"]');
  await page.waitForTimeout(95000);
  return {net, body: await page.evaluate(()=>document.body.innerText.replace(/\n+/g,' | ').slice(0,150))};
};
