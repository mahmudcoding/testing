export default async ({page}) => {
  const who = process.env.QA_WHO || 'QA Bob';
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(/record/i.test(u)&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,300);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  const cb = page.locator(`[role="dialog"] input[type=checkbox]`).nth(1); // QA Bob
  const name = await page.evaluate(()=>{const c=[...document.querySelectorAll('[role="dialog"] input[type=checkbox]')][1]; const l=document.querySelector('label[for="'+c.id+'"]'); return l?l.innerText.trim():null;});
  await cb.check({force:true});
  await page.waitForTimeout(700);
  await page.locator('[role="dialog"] button', {hasText:/^Save$/}).first().click();
  await page.waitForTimeout(3500);
  const after = await page.evaluate(()=>({toasts:[...document.querySelectorAll('[data-sonner-toast],[role="status"],[role="alert"]')].map(t=>t.innerText.replace(/\n+/g,' ').slice(0,140)).filter(Boolean)}));
  return {checkedName: name, net, after};
};
