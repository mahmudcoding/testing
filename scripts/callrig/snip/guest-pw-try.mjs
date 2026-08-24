export default async ({page}) => {
  const name = process.env.QA_GNAME||'PW Guest';
  const pw = process.env.QA_GPW||'';
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/')){let b='';try{b=(await r.text()).slice(0,300);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  const labels = await page.evaluate(() => [...document.querySelectorAll('label')].map(l=>({for:l.getAttribute('for'), t:l.textContent.trim().slice(0,90)})));
  await page.fill('input[type=text]', name);
  if (pw) await page.fill('input[type=password]', pw);
  await page.locator('button', {hasText:'Join call'}).first().click();
  await page.waitForTimeout(5000);
  const st = await page.evaluate(() => ({
    url: location.href,
    body: document.body.innerText.replace(/\n+/g,' | ').slice(0,450),
    inputInvalid: (document.querySelector('input[type=password]')||{}).getAttribute?.('aria-invalid'),
    toasts: [...document.querySelectorAll('[role="status"],[role="alert"],[data-sonner-toast]')].map(t=>t.innerText.replace(/\n+/g,' ').slice(0,140)).filter(Boolean)
  }));
  return {labels, net: net.filter(l=>/join|guest/i.test(l)).slice(0,6), st};
};
