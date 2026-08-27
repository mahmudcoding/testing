export default async ({page}) => {
  const ws='W4QCF1XTURESO01', id='C4QCGENERAL0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${id}`, {waitUntil:'load'});
  await page.waitForTimeout(4000);
  const b = page.locator('button[aria-label="Unmute notifications"]').first();
  if(!await b.count()) return {alreadyUnmuted:true};
  await b.click(); await page.waitForTimeout(2500);
  return await page.evaluate(()=>{const x=document.querySelector('button[aria-label="Mute notifications"],button[aria-label="Unmute notifications"]');
    return x?{l:x.getAttribute('aria-label'),p:x.getAttribute('aria-pressed')}:null;});
};
