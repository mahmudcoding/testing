export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(/record|share/i.test(u)&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,300);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls/V4OTMTBKMTGKA9B?tab=recording&recording=RC4OTMXUDAES16T6',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  await page.evaluate(() => { window.__clip=null; if (navigator.clipboard) navigator.clipboard.writeText = async t => { window.__clip = t; }; });
  const b = page.locator('main button', {hasText:/^Share$/}).first();
  if (!(await b.count())) return {err:'no Share'};
  await b.click();
  await page.waitForTimeout(3000);
  const st = await page.evaluate(() => {
    const d=[...document.querySelectorAll('[role="dialog"]')].pop();
    return {dialog: d? d.innerText.replace(/\n+/g,' | ').slice(0,500):null,
            captured: window.__clip,
            toasts: [...document.querySelectorAll('[data-sonner-toast],[role="status"],[role="alert"]')].map(t=>t.innerText.replace(/\n+/g,' ').slice(0,140)).filter(Boolean)};
  });
  return {net, st};
};
