export default async ({page}) => {
  const section = Number(process.env.QA_SECTION||0);   // 0 mic, 1 camera, 2 screen
  const choice  = Number(process.env.QA_CHOICE||2);    // 0 Inherit, 1 Allow, 2 Block
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/meeting')&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,300);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  const res = await page.evaluate(({section,choice})=>{
    const ms=[...document.querySelectorAll('[role="dialog"]')].filter(m=>!['call-overlay-expanded','participants-list-panel'].includes(m.getAttribute('data-testid')));
    const m=ms[ms.length-1]; if(!m) return {err:'no dialog'};
    const radios=[...m.querySelectorAll('[role="radio"]')];
    const target=radios[section*3+choice];
    if(!target) return {err:'no radio', count:radios.length};
    target.setAttribute('data-qa-r','1');
    return {ok:true, label: target.textContent.trim(), total: radios.length};
  }, {section,choice});
  if (res.err) return res;
  await page.click('[data-qa-r="1"]');
  await page.waitForTimeout(800);
  const save = page.locator('[data-testid="device-permissions-save"]');
  const dis = await save.isDisabled();
  if (!dis) { await save.click(); await page.waitForTimeout(4000); }
  const toasts=await page.evaluate(()=>[...document.querySelectorAll('[role="status"],[role="alert"]')].map(e=>e.innerText.replace(/\n+/g,' | ').slice(0,150)).filter(Boolean));
  return {picked: res.label, saveWasDisabled: dis, net, toasts};
};
