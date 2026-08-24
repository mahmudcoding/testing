export default async ({page}) => {
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  return await page.evaluate(()=>{const t=document.querySelector('main').innerText; const i=t.indexOf('Live now'); return t.slice(i,i+140).replace(/\n+/g,' | ');});
};
