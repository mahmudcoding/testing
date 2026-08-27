export default async ({page}) => {
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(Number(process.env.QA_WAIT||9000));
  return await page.evaluate(()=>({url:location.href, txt:(document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,220)}));
};
