export default async ({page}) => {
  const netlog = [];
  page.on('response', async r => { const u=r.url(); if(u.includes('breakout')||u.includes('room')){ let b=''; try{b=(await r.text()).slice(0,300);}catch(e){} netlog.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);} });
  const b = await page.$('button[aria-label="New Side Room"]') || await page.$('button:has-text("New Side Room")');
  if (!b) return {err:'no New Side Room'};
  await b.click();
  await page.waitForTimeout(2500);
  const form = await page.evaluate(() => {
    const s = document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    return {text: s.innerText.replace(/\n+/g,' | ').slice(0,800),
      fields: [...s.querySelectorAll('input,textarea,select')].map(e=>`${e.tagName}|${e.type||''}|${e.getAttribute('aria-label')||e.placeholder||''}|${e.getAttribute('data-testid')||''}`),
      btns: [...s.querySelectorAll('button')].map(e=>(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,35)).filter(Boolean)};
  });
  return {net: netlog, form};
};
