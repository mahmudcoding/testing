export default async ({page}) => {
  const netlog = [];
  page.on('response', async r => { const u=r.url(); if(u.includes('breakout')||u.includes('side')){ let b=''; try{b=(await r.text()).slice(0,400);}catch(e){} netlog.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);} });
  await page.fill('[data-testid="side-room-create-name"]', process.env.QA_ROOM || 'QA Side Room 1');
  await page.waitForTimeout(400);
  const dlgs = await page.$$('[role="dialog"]');
  const modal = dlgs[dlgs.length-1];
  const btns = await modal.$$('button');
  let done = [];
  for (const b of btns) { const t=(await b.innerText()).trim(); if (/^Create room$/i.test(t)) { await b.click(); done.push('create'); break; } }
  await page.waitForTimeout(5000);
  const state = await page.evaluate(() => {
    const s = document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    return s.innerText.replace(/\n+/g,' | ').slice(0,600);
  });
  const api = await page.evaluate(async () => (await (await fetch('/api/v1/meeting/V4OS2FBRHQKDHV8/breakout-rooms',{credentials:'include'})).text()).slice(0,700));
  return {done, net: netlog, state, api};
};
