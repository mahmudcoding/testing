export default async ({page}) => {
  const M = process.env.QA_MEET;
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('recording')){let b='';try{b=(await r.text()).slice(0,400);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  const radios = page.locator('[role="dialog"] input[type=radio]');
  const n = await radios.count();
  await radios.nth(2).check({force:true});
  await page.waitForTimeout(1500);
  const afterPick = await page.evaluate(() => {
    const d=[...document.querySelectorAll('[role="dialog"]')].pop();
    return {text: d.innerText.replace(/\n+/g,' | ').slice(0,700),
            checkboxes: [...d.querySelectorAll('input[type=checkbox]')].map(c=>c.getAttribute('aria-label')),
            testids: [...new Set([...d.querySelectorAll('[data-testid]')].map(e=>e.getAttribute('data-testid')))].slice(0,20)};
  });
  await page.locator('[role="dialog"] button', {hasText:'Start recording'}).first().click();
  await page.waitForTimeout(6000);
  const after = await page.evaluate(async (M) => {
    const recs = await (await fetch('/api/v1/meeting/'+M+'/recordings',{credentials:'include'})).text();
    return {recs: recs.slice(0,500),
      badge: !!document.querySelector('[data-testid="call-recording-badge"]'),
      toasts: [...document.querySelectorAll('[data-sonner-toast],[role="status"],[role="alert"]')].map(t=>t.innerText.replace(/\n+/g,' ').slice(0,140)).filter(Boolean)};
  }, M);
  return {nRadios:n, afterPick, net, after};
};
