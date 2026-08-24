export default async ({page}) => {
  const netlog=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,400);}catch(e){} netlog.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  const d=(await page.$$('[role="dialog"]')).pop();
  if (!d) return {err:'no dialog'};
  await d.$eval('input[type=text]', (e,v)=>{ }, '').catch(()=>{});
  const title = await d.$('input[type=text]');
  if (title) await title.fill(process.env.QA_TITLE||'QA Scheduled Call');
  // set start time a couple of minutes ahead
  const st = await d.$('input[type=time]');
  if (st && process.env.QA_START) await st.fill(process.env.QA_START);
  const times = await d.$$('input[type=time]');
  if (times[1] && process.env.QA_END) await times[1].fill(process.env.QA_END);
  // invite Bob
  const btns = await d.$$('button');
  for (const b of btns) { const t=(await b.innerText()).trim(); if (t==='QA Bob') { await b.click(); break; } }
  await page.waitForTimeout(800);
  let submitted=false;
  for (const b of btns) { const t=(await b.innerText()).trim(); if (/^Запланировать встречу$/.test(t)) { await b.click(); submitted=true; break; } }
  await page.waitForTimeout(6000);
  const after = await page.evaluate(()=>({dialogs:[...document.querySelectorAll('[role="dialog"]')].length,
    main:(document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,500),
    toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].map(e=>e.innerText.trim()).filter(Boolean).slice(0,4)}));
  return {submitted, net: netlog, after};
};
