export default async ({page}) => {
  const msg = process.env.QA_MSG || 'QA-NIGHT-CHAT';
  const net = [];
  page.on('response', async r => { const u=r.url(); if(u.includes('chat')||u.includes('/api/v1/meeting')){ let b=''; try{b=(await r.text()).slice(0,250);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);} });
  const t = page.locator('[data-testid="call-controls-chat-toggle"]');
  if (await t.count() && await t.getAttribute('aria-pressed') !== 'true') { await t.click(); await page.waitForTimeout(2500); }
  const panelSel = 'aside';
  const ta = await page.$('aside textarea');
  if (!ta) return {err: 'no composer'};
  await ta.fill(msg);
  await page.waitForTimeout(800);
  const btns = await page.$$('aside button');
  let clicked=null;
  for (const b of btns) { const t2=((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim(); if (/^Send$/i.test(t2)) { if (await b.isDisabled()) { clicked='Send DISABLED'; } else { await b.click(); clicked='Send'; } break; } }
  await page.waitForTimeout(4000);
  const after = await page.evaluate(() => {
    const p = [...document.querySelectorAll('aside')].pop();
    return p ? p.innerText.replace(/\n+/g,' | ').slice(0,400) : null;
  });
  return {typed: msg, clicked, net, panelAfter: after};
};
