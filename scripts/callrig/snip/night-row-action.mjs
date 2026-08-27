export default async ({page}) => {
  const who = process.env.QA_WHO || 'QA Bob';
  const item = process.env.QA_ITEM;
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/meeting')&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,300);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  const t = page.locator('[data-testid="call-controls-people-toggle"]');
  if (await t.count() && await t.getAttribute('aria-pressed') !== 'true') { await t.click(); await page.waitForTimeout(2500); }
  const res = await page.evaluate((who)=>{
    document.querySelectorAll('[data-qa-target]').forEach(e=>e.removeAttribute('data-qa-target'));
    const panel=document.querySelector('[data-testid="participants-list-panel"]');
    if(!panel) return {err:'no panel'};
    const rows=[...panel.querySelectorAll('div,li')].filter(e=>e.innerText && e.innerText.includes(who) && e.querySelector('button[aria-label="Participant actions"]'));
    if(!rows.length) return {err:'no row for '+who};
    const b=rows[rows.length-1].querySelector('button[aria-label="Participant actions"]');
    b.setAttribute('data-qa-target','1');
    return {ok:true};
  }, who);
  if (res.err) return res;
  await page.click('[data-qa-target="1"]');
  await page.waitForTimeout(1800);
  const el = page.locator('[data-testid="'+item+'"]');
  if (!await el.count()) return {err:'item missing: '+item};
  const label = await el.getAttribute('aria-label') || await el.innerText();
  await el.click();
  await page.waitForTimeout(Number(process.env.QA_WAIT||3500));
  const dlg = await page.evaluate(()=>{
    const ms=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded');
    const m=ms[ms.length-1];
    return m?{testid:m.getAttribute('data-testid'), text:m.innerText.replace(/\n+/g,' | ').slice(0,900),
      controls:[...m.querySelectorAll('button,input,[role="switch"],[role="radio"],select')].map(e=>({
        l:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,45), t:e.getAttribute('data-testid'),
        role:e.getAttribute('role'), checked:e.getAttribute('aria-checked'), d:e.disabled}))}:{none:true};
  });
  return {clicked: label, net, dialog: dlg};
};
