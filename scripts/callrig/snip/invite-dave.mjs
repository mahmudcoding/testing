export default async ({page}) => {
  const net = [];
  page.on('response', async r => { const u=r.url(); if(u.includes('/api/v1/')&&!u.includes('presence')&&!u.includes('unread')){ let b=''; try{b=(await r.text()).slice(0,260);}catch(e){} if(r.request().method()!=='GET'||/invite|notif/.test(u)) net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);} });
  const s = page.locator('[role="dialog"] input[type=search]').last();
  await s.fill('');
  await page.waitForTimeout(1200);
  await page.locator('[role="dialog"] input[type=checkbox][aria-label="QA Dave"]').check();
  await page.waitForTimeout(600);
  const btnText = await page.evaluate(() => {
    const dlg=[...document.querySelectorAll('[role="dialog"]')].pop();
    const b=[...dlg.querySelectorAll('button')].find(x=>/Invite \(/.test(x.textContent));
    return b? {t:b.textContent.trim(), d:b.disabled}:null;
  });
  await page.locator('[role="dialog"] button', {hasText: /^Invite \(/}).first().click();
  await page.waitForTimeout(3500);
  const after = await page.evaluate(() => {
    const dlg=[...document.querySelectorAll('[role="dialog"]')].pop();
    return {dialogStillOpen: !!dlg, text: dlg? dlg.innerText.replace(/\n+/g,' | ').slice(0,400): (document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,300),
            toasts: [...document.querySelectorAll('[role="status"],[role="alert"],[data-sonner-toast]')].map(t=>t.innerText.replace(/\n+/g,' ').slice(0,120))};
  });
  return {btnText, net, after};
};
