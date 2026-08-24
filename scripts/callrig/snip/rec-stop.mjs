export default async ({page}) => {
  const M = process.env.QA_MEET;
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('recording')||u.includes('transcript')){let b='';try{b=(await r.text()).slice(0,400);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  const btn = page.locator('[data-testid="call-toolbar"] button[aria-label*="ecording"], [data-testid="call-toolbar"] button[aria-label="Stop recording"]').first();
  const labels = await page.evaluate(() => [...document.querySelectorAll('[data-testid="call-toolbar"] button')].map(b=>b.getAttribute('aria-label')).filter(Boolean));
  let stopped=null;
  if (await btn.count()) { await btn.click(); await page.waitForTimeout(1500);
    const cf = page.locator('[role="dialog"],[role="alertdialog"]').last();
    const dlgText = await page.evaluate(()=>{const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].pop(); return d? d.innerText.replace(/\n+/g,' | ').slice(0,300):null;});
    const cb = page.locator('[role="dialog"] button, [role="alertdialog"] button', {hasText:/Stop/}).last();
    if (await cb.count()) { await cb.click(); stopped='confirmed'; } else stopped='clicked-no-confirm';
    var dt = dlgText;
  }
  await page.waitForTimeout(9000);
  const after = await page.evaluate(async (M) => {
    const j = async p => { const r=await fetch(p,{credentials:'include'}); return r.status+' :: '+(await r.text()).slice(0,600); };
    return {recordings: await j('/api/v1/meeting/'+M+'/recordings')};
  }, M);
  return {labels, stopped, confirmDialog: typeof dt!=='undefined'?dt:null, net, after};
};
