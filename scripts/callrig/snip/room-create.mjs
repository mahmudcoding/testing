export default async ({page}) => {
  const M = process.env.QA_MEET;
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('breakout')){let b='';try{b=(await r.text()).slice(0,400);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  const t = page.locator('[data-testid="call-controls-breakout-rooms"]');
  if (await t.count() && (await t.getAttribute('aria-pressed'))!=='true') { await t.click(); await page.waitForTimeout(2500); }
  const panel = await page.evaluate(() => {
    const s=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    return {text: s.innerText.replace(/\n+/g,' | ').slice(0,500),
            buttons: [...s.querySelectorAll('button')].map(b=>`${(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,36)}#${b.getAttribute('data-testid')||'-'}`).slice(-20)};
  });
  const nb = page.locator('button', {hasText:'New Side Room'}).first();
  if (await nb.count()) { await nb.click(); await page.waitForTimeout(1500); }
  const dlg = await page.evaluate(() => {
    const d=[...document.querySelectorAll('[role="dialog"]')].pop();
    return {text: d? d.innerText.replace(/\n+/g,' | ').slice(0,500):null,
            inputs: d? [...d.querySelectorAll('input,select,textarea')].map(i=>`${i.type}|${i.getAttribute('data-testid')||i.id}|${i.placeholder||''}`):[],
            buttons: d? [...d.querySelectorAll('button')].map(b=>`${(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,36)}#${b.getAttribute('data-testid')||'-'}`):[]};
  });
  const nameField = page.locator('[data-testid="side-room-create-name"]');
  if (await nameField.count()) { await nameField.fill(process.env.QA_ROOM||'QA Room A'); await page.waitForTimeout(400); }
  const cb = page.locator('[role="dialog"] button', {hasText:/^Create room$/i}).first();
  if (await cb.count()) { await cb.click(); await page.waitForTimeout(5000); }
  const api = await page.evaluate(async (M) => (await (await fetch('/api/v1/meeting/'+M+'/breakout-rooms',{credentials:'include'})).text()).slice(0,700), M);
  return {panel, dlg, net, api};
};
