export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QCF1XTURESO01/directories?tab=people', {waitUntil:'load'});
  await page.waitForTimeout(3500);
  return await page.evaluate(async () => {
    const g = async (p) => { const r = await fetch(p,{credentials:'include'}); return {s:r.status, b:(await r.text()).slice(0,500)}; };
    return {blocked: await g('/api/v1/messaging/users/blocked')};
  });
};
