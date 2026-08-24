export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/')&&(r.request().method()!=='GET'||r.status()>=400)){let b='';try{b=(await r.text()).slice(0,300);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/directories?tab=people',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  // find the Call button on the QA Bob row
  const res = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('main *')].filter(e=>/QA Bob/.test(e.textContent) && e.querySelector && [...e.querySelectorAll('button')].some(b=>/^Call$/.test(b.textContent.trim())));
    const row = rows[rows.length-1];
    if (!row) return {err:'no row'};
    const b = [...row.querySelectorAll('button')].find(x=>/^Call$/.test(x.textContent.trim()));
    b.setAttribute('data-qa-call','1');
    return {ok:true, rowText: row.innerText.replace(/\n+/g,' | ').slice(0,120), disabled: b.disabled};
  });
  if (res.err) return {res, body: await page.evaluate(()=>document.querySelector('main').innerText.slice(0,400))};
  await page.click('[data-qa-call="1"]');
  await page.waitForTimeout(8000);
  const after = await page.evaluate(()=>({
    url: location.href,
    dialogs: [...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].map(d=>`${d.getAttribute('data-testid')||'-'} :: ${d.innerText.replace(/\n+/g,' | ').slice(0,300)}`),
    toasts: [...document.querySelectorAll('[data-sonner-toast],[role="status"],[role="alert"]')].map(t=>t.innerText.replace(/\n+/g,' ').slice(0,150)).filter(Boolean),
    body: document.body.innerText.replace(/\n+/g,' | ').slice(0,300)
  }));
  return {res, net, after};
};
