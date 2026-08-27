export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  await page.locator('button[aria-label^="Notifications"]').first().click();
  await page.waitForTimeout(2500);
  const urlBefore = page.url();
  const row = page.locator('[role=dialog] button, [role=menu] button').filter({hasText:'Meeting invitation'}).first();
  const n = await row.count();
  if(!n) return {err:'no invitation row'};
  await row.click();
  const samples=[];
  for(let i=0;i<12;i++){ await page.waitForTimeout(500); samples.push(await page.evaluate(()=>({u:location.pathname+location.search, d:!!document.querySelector('[role=dialog]')}))); }
  const badge = await page.evaluate(()=>{
    const b=document.querySelector('button[aria-label^="Notifications"]');
    return b? b.getAttribute('aria-label'):null;});
  const main = await page.evaluate(()=>document.querySelector('main').innerText.replace(/\n{2,}/g,' | ').slice(0,300));
  return {urlBefore:new URL(urlBefore).pathname, urlAfter:samples[samples.length-1].u, dialogOpen:samples[samples.length-1].d, badge, main};
};
