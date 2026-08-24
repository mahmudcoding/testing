export default async ({page}) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setEmulatedMedia', {features:[{name:'prefers-color-scheme', value:'light'}]}).catch(()=>{});
  await page.goto('http://127.0.0.1:8781/', {waitUntil:'networkidle'});
  await page.waitForTimeout(2000);
  const y = await page.evaluate(()=>{const t=[...document.querySelectorAll('.id')].find(e=>e.textContent.trim()==='BUG-17'); return t? t.getBoundingClientRect().top+scrollY-40 : 0;});
  await page.evaluate(v=>window.scrollTo(0,v), y);
  await page.waitForTimeout(800);
  await page.screenshot({path:'/Users/mahmud/Projects/testing/.playwright-mcp/callshots/report-bug17.png'});
  const r = await page.evaluate(()=>({overflow: document.documentElement.scrollWidth>innerWidth, items: document.querySelectorAll('.item').length, tally: [...document.querySelectorAll('.num')].map(n=>n.textContent.trim())}));
  await cdp.detach().catch(()=>{});
  return r;
};
