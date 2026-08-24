export default async ({page}) => {
  const netlog=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,300);}catch(e){} netlog.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  const inp = await page.$('[data-testid="meeting-settings-max-participants-input"]');
  if (!inp) return {err:'no input'};
  await inp.fill(process.env.QA_LIMIT || '2');
  await page.waitForTimeout(500);
  const save = await page.$('[data-testid="meeting-settings-save"]');
  const saveState = save ? {disabled: await save.isDisabled()} : 'no save';
  if (save) await save.click().catch(e=>{});
  await page.waitForTimeout(5000);
  const after = await page.evaluate(()=>{
    const p=document.querySelector('[data-testid="meeting-settings-panel"]');
    return {panel: p? p.innerText.replace(/\n+/g,' | ').slice(0,500):'none',
            toasts: [...document.querySelectorAll('[role="status"],[role="alert"]')].map(e=>e.innerText.trim()).filter(Boolean).slice(0,6),
            participants: [...document.querySelectorAll('[data-testid="participant-tile"]')].length};
  });
  const api = await page.evaluate(async()=>({
    m: (await (await fetch('/api/v1/meeting/V4OS3ECSEJTVAUZ',{credentials:'include'})).text()).slice(0,320),
    p: (await (await fetch('/api/v1/meeting/V4OS3ECSEJTVAUZ/participants',{credentials:'include'})).text()).slice(0,160)
  }));
  return {saveState, net: netlog, after, api};
};
