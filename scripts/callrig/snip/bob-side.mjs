export default async ({page}) => {
  const netlog=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('breakout')){let b='';try{b=(await r.text()).slice(0,200);}catch(e){} netlog.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  const t = await page.$('button[aria-label="Side Rooms"]');
  if (t && (await t.getAttribute('aria-pressed'))!=='true') { await t.click(); await page.waitForTimeout(2500); }
  const panelText = await page.evaluate(()=>{const s=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body; return s.innerText.replace(/\n+/g,' | ').slice(0,600);});
  const btns = await page.evaluate(()=>[...document.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim()).filter(Boolean).slice(-25));
  let joined=null;
  for (const label of ['Join room','Join','Join Side Room']) {
    const b = await page.$(`button:has-text("${label}")`);
    if (b) { const vis = await b.isVisible().catch(()=>false); if (vis) { await b.click(); joined=label; break; } }
  }
  await page.waitForTimeout(6000);
  const after = await page.evaluate(()=>{const s=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body; return s.innerText.replace(/\n+/g,' | ').slice(0,600);});
  return {panelText, btns, joined, after, net: netlog};
};
