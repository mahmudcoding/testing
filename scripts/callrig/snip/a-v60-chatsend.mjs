export default async ({ page }) => {
  const t='V60-ROOMCHAT-'+Math.floor(Date.now()/1000%100000);
  const ta = await page.$('textarea[placeholder="Message everyone"]');
  if(!ta) return {err:'no composer'};
  await ta.click(); await page.keyboard.type(t,{delay:16}); await page.keyboard.press('Enter');
  await page.waitForTimeout(3000);
  return { sent:t };
};
