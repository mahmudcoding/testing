export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  const grab = () => page.evaluate(() => {
    const main=document.querySelector('main')||document.body;
    return main.innerText.replace(/\n{2,}/g,' | ').slice(0,700);
  });
  const res={};
  await page.goto(`https://airion-cargo.store/w/${WS}/directories?tab=people`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(2500);
  const inp = 'input[placeholder="Search people or channels"]';
  for (const q of ['bob','qa-gen','zzzznope']) {
    await page.fill(inp,'');
    await page.waitForTimeout(400);
    await page.fill(inp,q);
    await page.waitForTimeout(1800);
    res['people::'+q] = await grab();
  }
  // now channels tab
  await page.fill(inp,'');
  await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/directories?tab=channels`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(2500);
  for (const q of ['bob','qa-gen','zzzznope']) {
    await page.fill(inp,'');
    await page.waitForTimeout(400);
    await page.fill(inp,q);
    await page.waitForTimeout(1800);
    res['chan::'+q] = await grab();
  }
  return res;
};
