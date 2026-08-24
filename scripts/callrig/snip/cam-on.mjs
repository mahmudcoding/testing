export default async ({page}) => {
  const b = page.locator('[data-testid="call-toolbar"] button[aria-label="Turn camera on"]').first();
  if (!(await b.count())) return {already: await page.evaluate(()=>[...document.querySelectorAll('[data-testid="call-toolbar"] button')].map(x=>x.getAttribute('aria-label')).filter(Boolean))};
  await b.click();
  await page.waitForTimeout(5000);
  return await page.evaluate(()=>({label: [...document.querySelectorAll('[data-testid="call-toolbar"] button')].map(x=>x.getAttribute('aria-label')).filter(l=>/camera/i.test(l))}));
};
