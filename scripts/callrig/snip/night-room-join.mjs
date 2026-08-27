export default async ({page}) => {
  const t = page.locator('[data-testid="call-controls-breakout-rooms"]');
  if (await t.getAttribute('aria-pressed') !== 'true') { await t.click(); await page.waitForTimeout(2500); }
  const p = await page.$('[data-testid="breakout-rooms-panel"]');
  const btns = await p.$$('button');
  let clicked=null;
  for (const b of btns){ const l=((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim(); if(/^Join$/i.test(l)){ await b.click(); clicked=l; break; } }
  if(!clicked) return {err:'no Join', panel: await p.evaluate(e=>e.innerText.replace(/\n+/g,' | ').slice(0,300))};
  await page.waitForTimeout(8000);
  return await page.evaluate(()=>({
    panel:(p=>p?p.innerText.replace(/\n+/g,' | ').slice(0,250):null)(document.querySelector('[data-testid="breakout-rooms-panel"]')),
    topBar:(t=>t?t.innerText.replace(/\n+/g,' | ').slice(0,150):null)(document.querySelector('[data-testid="call-top-bar"]')),
    tiles:[...document.querySelectorAll('[data-testid="participant-tile"]')].map(t=>{const n=t.querySelector('[data-testid="participant-name"]');return n?n.innerText.trim():'?';})
  }));
};
