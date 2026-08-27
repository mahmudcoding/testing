export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QEF1XTURESO01/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  return await page.evaluate(`(async () => {
    const r=await fetch('/api/v1/calendar/meetings/S4OWSESS9KOG8BT',{method:'PATCH',credentials:'include',
      headers:{'Content-Type':'application/json'}, body:JSON.stringify({is_private:${process.env.QA_PRIV}})});
    const t=await r.text();
    return {st:r.status, priv:(t.match(/"is_private"\\s*:\\s*(true|false)/)||[])[1]||t.slice(0,120)}; })()`);
};
