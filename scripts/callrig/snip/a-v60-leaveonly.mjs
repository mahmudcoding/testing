export default async ({ page }) => {
  const b = page.locator('button').filter({hasText:/^Leave call$/}).first();
  if(!(await b.count())) return {noLeave:true};
  await b.click().catch(()=>{});
  await page.waitForTimeout(4000);
  return await page.evaluate(()=>({url:location.pathname.slice(-20)}));
};
