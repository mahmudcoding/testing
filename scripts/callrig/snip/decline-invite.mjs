export default async ({page}) => {
  const net = [];
  page.on('response', async r => { const u=r.url(); if(u.includes('/api/v1/meeting')){ let b=''; try{b=(await r.text()).slice(0,300);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);} });
  const before = await page.evaluate(async () => (await (await fetch('/api/v1/meeting/'+'V4OTLVMJL42ZGIG',{credentials:'include'})).text()).slice(0,200));
  const btn = page.locator('button', {hasText: /^Decline$/}).first();
  const n = await btn.count();
  if (!n) return {err:'no Decline button', body: await page.evaluate(()=>document.body.innerText.slice(0,300))};
  await btn.click();
  await page.waitForTimeout(3000);
  const after = await page.evaluate(async () => {
    const m = await (await fetch('/api/v1/meeting/V4OTLVMJL42ZGIG',{credentials:'include'})).text();
    return {meeting: m.slice(0,300), body: document.body.innerText.replace(/\n+/g,' | ').slice(0,300)};
  });
  return {before, net, after};
};
