export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(/record|share/i.test(u)&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,300);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  const esc = page.locator('[role="dialog"] button[aria-label="Close"]').first();
  if (await esc.count()) { await esc.click().catch(()=>{}); await page.waitForTimeout(1200); }
  const b = page.locator('main button', {hasText:/^Share$/}).first();
  if (!(await b.count())) return {err:'no Share', buttons: await page.evaluate(()=>[...document.querySelectorAll('main button')].map(x=>x.textContent.trim().slice(0,30)).slice(0,20))};
  await b.click();
  await page.waitForTimeout(2500);
  const st = await page.evaluate(async () => {
    const d=[...document.querySelectorAll('[role="dialog"]')].pop();
    let clip=null; try { clip = (await navigator.clipboard.readText()).slice(0,160); } catch(e) { clip='ERR '+String(e).slice(0,60); }
    return {dialog: d? d.innerText.replace(/\n+/g,' | ').slice(0,500):null,
            toasts: [...document.querySelectorAll('[data-sonner-toast],[role="status"],[role="alert"]')].map(t=>t.innerText.replace(/\n+/g,' ').slice(0,140)).filter(Boolean),
            clipboard: clip};
  });
  return {net, st};
};
