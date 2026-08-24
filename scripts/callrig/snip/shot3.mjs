export default async ({page}) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setEmulatedMedia', {features:[{name:'prefers-color-scheme', value: process.env.QA_THEME||'light'}]}).catch(()=>{});
  await page.goto('http://127.0.0.1:8779/', {waitUntil:'networkidle'});
  await page.waitForTimeout(2000);
  const y = await page.evaluate(()=>{const els=[...document.querySelectorAll('.id')]; const t=els.find(e=>e.textContent.trim()==='BUG-15'); return t? t.getBoundingClientRect().top + scrollY - 60 : 2000;});
  await page.evaluate(v=>window.scrollTo(0,v), y);
  await page.waitForTimeout(900);
  await page.screenshot({path: process.env.QA_SHOT});
  const r = await page.evaluate(()=>({overflow: document.documentElement.scrollWidth>innerWidth,
    tables: document.querySelectorAll('.tblwrap').length, findings: document.querySelectorAll('.item').length}));
  await cdp.detach().catch(()=>{});
  return r;
};
