export default async ({page}) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setEmulatedMedia', {features:[{name:'prefers-color-scheme', value: process.env.QA_THEME||'light'}]}).catch(()=>{});
  await page.goto('http://127.0.0.1:8777/', {waitUntil:'networkidle'});
  await page.waitForTimeout(2500);
  await page.screenshot({path: process.env.QA_SHOT, fullPage: false});
  const check = await page.evaluate(()=>{
    const cs=getComputedStyle(document.body);
    const h1=document.querySelector('h1');
    return {bodyBg: cs.backgroundColor, bodyColor: cs.color,
            h1Font: getComputedStyle(h1).fontFamily.split(',')[0],
            bodyFont: cs.fontFamily.split(',')[0],
            docScrollW: document.documentElement.scrollWidth, innerW: innerWidth,
            horizontalOverflow: document.documentElement.scrollWidth > innerWidth};
  });
  await cdp.detach().catch(()=>{});
  return check;
};
