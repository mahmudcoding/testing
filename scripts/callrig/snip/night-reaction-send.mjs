export default async ({page}) => {
  const emoji = process.env.QA_EMOJI || '🎉';
  const net = [];
  page.on('response', async r => { const u=r.url(); if(u.includes('reaction')||u.includes('/api/v1/meeting')){ let b=''; try{b=(await r.text()).slice(0,200);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);} });
  // open picker if not open
  let pop = await page.$('[role="dialog"] button');
  const trig = page.locator('[data-testid="call-controls-live-reaction"]');
  const exp = await trig.getAttribute('aria-expanded');
  if (exp !== 'true') { await trig.click(); await page.waitForTimeout(1200); }
  const btns = await page.$$('[role="dialog"] button');
  let clicked=null;
  for (const b of btns) { const t=(await b.innerText()).trim(); if (t===emoji) { await b.click(); clicked=t; break; } }
  await page.waitForTimeout(3000);
  const own = await page.evaluate(()=>{
    const out=[];
    document.querySelectorAll('[data-testid*="reaction"],[class*="reaction" i]').forEach(e=>out.push({sel:e.getAttribute('data-testid')||String(e.className).slice(0,40), txt:(e.innerText||'').replace(/\n+/g,'/').slice(0,60)}));
    return out;
  });
  return {clicked, net, ownSideAfter3s: own};
};
