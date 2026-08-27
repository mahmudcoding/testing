export default async ({ page }) => {
  const read = () => page.evaluate(() => ({
    bodyBg: getComputedStyle(document.body).backgroundColor,
    bodyColor: getComputedStyle(document.body).color,
    h1Color: (()=>{const h=document.querySelector('h1'); return h?getComputedStyle(h).color:null;})(),
    preBg: (()=>{const p=document.querySelector('pre'); return p?getComputedStyle(p).backgroundColor:null;})(),
    articleBg: (()=>{const a=document.querySelector('article'); return a?getComputedStyle(a).backgroundColor:null;})(),
    chipSev: (()=>{const c=document.querySelector('.chip.sev'); return c?getComputedStyle(c).color:null;})(),
  }));
  await page.emulateMedia({ colorScheme: 'light' }); await page.waitForTimeout(600);
  const light = await read();
  await page.emulateMedia({ colorScheme: 'dark' }); await page.waitForTimeout(600);
  const darkSystem = await read();
  await page.evaluate(() => document.documentElement.setAttribute('data-theme','light'));
  await page.waitForTimeout(400);
  const forcedLight = await read();
  await page.evaluate(() => document.documentElement.setAttribute('data-theme','dark'));
  await page.waitForTimeout(400);
  const forcedDark = await read();
  await page.evaluate(() => document.documentElement.removeAttribute('data-theme'));
  await page.emulateMedia({ colorScheme: null });
  return { light, darkSystem, forcedLight, forcedDark };
};
