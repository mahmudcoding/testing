export default async ({page}) => {
  const netlog=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/admit')){let b='';try{b=(await r.text()).slice(0,250);}catch(e){} netlog.push(`${r.request().method()} ${r.status()} :: ${b}`);}});
  const b = await page.$('button[aria-label^="Впустить"], button[aria-label^="Admit"]');
  if (!b) return {err:'no admit btn'};
  await b.click();
  await page.waitForTimeout(5000);
  const after = await page.evaluate(()=>({
    toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].map(e=>e.innerText.trim().replace(/\n+/g,' ')).filter(Boolean).slice(0,6),
    panel:(document.querySelector('[data-testid="participants-list-panel"]')||document.body).innerText.replace(/\n+/g,' | ').slice(0,300)
  }));
  return {net: netlog, after};
};
