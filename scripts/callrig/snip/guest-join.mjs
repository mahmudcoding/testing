export default async ({page}) => {
  const netlog=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/')){let b='';try{b=(await r.text()).slice(0,200);}catch(e){} if(/guest|join|meeting/.test(u)) netlog.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  await page.fill('input[type=text]', process.env.QA_GUESTNAME || 'QA Guest Visitor');
  await page.waitForTimeout(400);
  await page.click('button:has-text("Join call")');
  await page.waitForTimeout(8000);
  let body = await page.evaluate(()=>({url:location.href, text: document.body.innerText.replace(/\n+/g,' | ').slice(0,600),
    btns:[...document.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim()).filter(Boolean).slice(0,25)}));
  // if prejoin screen, click Join
  if (/READY TO JOIN|Join/i.test(body.text)) {
    const bs = await page.$$('button');
    for (const b of bs) { const t=((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim(); if (/^Join$/i.test(t)) { await b.click(); break; } }
    await page.waitForTimeout(9000);
    body = await page.evaluate(()=>({url:location.href, text: document.body.innerText.replace(/\n+/g,' | ').slice(0,600),
      btns:[...document.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim()).filter(Boolean).slice(0,25)}));
  }
  return {body, net: netlog};
};
