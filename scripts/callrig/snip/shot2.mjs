export default async ({page}) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setEmulatedMedia', {features:[{name:'prefers-color-scheme', value: process.env.QA_THEME||'dark'}]}).catch(()=>{});
  await page.goto('http://127.0.0.1:8778/', {waitUntil:'networkidle'});
  await page.waitForTimeout(2000);
  await page.evaluate(()=>window.scrollTo(0, 900));
  await page.waitForTimeout(800);
  await page.screenshot({path: process.env.QA_SHOT});
  const r = await page.evaluate(()=>({bg:getComputedStyle(document.body).backgroundColor, fg:getComputedStyle(document.body).color,
    overflow: document.documentElement.scrollWidth>innerWidth,
    chips: [...document.querySelectorAll('.chip')].map(c=>c.textContent.trim()).slice(0,4)}));
  await cdp.detach().catch(()=>{});
  return r;
};
