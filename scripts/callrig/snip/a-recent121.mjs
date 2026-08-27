export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const t = await page.$('[role="tab"]:has-text("1-to-1")');
  if (t) { await t.click(); await page.waitForTimeout(1500); }
  const rows = await page.evaluate(() => [...(document.querySelector('main')||document.body).querySelectorAll('li,[role="listitem"]')]
      .map(e=>e.innerText.replace(/\n+/g,' · ').trim()).filter(x=>/1-to-1/.test(x)).slice(0,6));
  const api = await page.evaluate(async () => {
    const j = await (await fetch('/api/v1/meetings/history?limit=20',{credentials:'include'})).json();
    return (j.meetings||[]).slice(0,6).map(m=>({id:m.id, st:m.started_at, en:m.ended_at,
      durSec: m.ended_at? Math.round((new Date(m.ended_at)-new Date(m.started_at))/1000): null, ch:m.channel_id, by:m.created_by}));
  });
  return {rows, api};
};
