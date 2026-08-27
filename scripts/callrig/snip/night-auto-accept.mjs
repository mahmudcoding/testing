export default async ({page}) => {
  const ms=Number(process.env.QA_MS||60000);
  const t0=Date.now();
  let found=null;
  while(Date.now()-t0<ms){
    const el = await page.$('[data-testid="app-breakout-invite-accept"]');
    if (el) { const txt = await page.evaluate(()=>{const p=document.querySelector('[data-testid="app-breakout-invite-prompt"]');return p?p.innerText.replace(/\n+/g,' | ').slice(0,180):null;});
      await el.click(); found={at: Math.round((Date.now()-t0)/100)/10+'s', prompt: txt}; break; }
    await page.waitForTimeout(300);
  }
  if(!found) return {err:'prompt never appeared within '+ms+'ms'};
  await page.waitForTimeout(8000);
  const after = await page.evaluate(()=>{
    const p=document.querySelector('[data-testid="breakout-rooms-panel"]');
    const top=document.querySelector('[data-testid="call-top-bar"]');
    return {panel: p?p.innerText.replace(/\n+/g,' | ').slice(0,300):null,
      topBar: top?top.innerText.replace(/\n+/g,' | ').slice(0,150):null,
      tiles:[...document.querySelectorAll('[data-testid="participant-tile"]')].map(t=>{const n=t.querySelector('[data-testid="participant-name"]');return n?n.innerText.trim():'?';})};
  });
  return {accepted: found, after};
};
