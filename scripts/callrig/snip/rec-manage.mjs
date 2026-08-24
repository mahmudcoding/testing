export default async ({page}) => {
  const url = process.env.QA_URL;
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(/record/i.test(u)&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,300);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  await page.goto(url, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  await page.click('[data-testid="recording-access-manage"]');
  await page.waitForTimeout(2000);
  const dlg = await page.evaluate(() => {
    const d=[...document.querySelectorAll('[role="dialog"]')].pop();
    if(!d) return {none:true};
    // accessible-name approximation for checkboxes
    const boxes = [...d.querySelectorAll('input[type=checkbox]')].map(c=>{
      const lab = document.querySelector('label[for="'+c.id+'"]') || c.closest('label');
      const row = c.closest('li,[role=option],div');
      return {id:c.id, aria:c.getAttribute('aria-label'), labelledby:c.getAttribute('aria-labelledby'),
              labelText: lab? lab.innerText.trim().slice(0,40):null,
              rowText: row? row.innerText.replace(/\n+/g,' ').trim().slice(0,40):null, checked:c.checked};
    });
    return {text: d.innerText.replace(/\n+/g,' | ').slice(0,700), boxes,
            buttons: [...d.querySelectorAll('button')].map(b=>`${(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,34)}#${b.getAttribute('data-testid')||'-'}`)};
  });
  const aria = await page.locator('[role="dialog"]').last().ariaSnapshot().catch(e=>String(e).slice(0,100));
  return {dlg, ariaSnapshot: typeof aria==='string'? aria.slice(0,1200):aria, net};
};
