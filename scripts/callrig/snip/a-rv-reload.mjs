export default async ({ page }) => {
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(Number(process.env.QA_WAIT || 9000));
  return { url: page.url(), text: (await page.evaluate(()=>document.body.innerText)).replace(/\s+/g,' ').slice(0,180) };
};
