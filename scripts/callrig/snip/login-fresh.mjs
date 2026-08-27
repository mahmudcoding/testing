export default async ({page, ctx}) => {
  const email = process.env.QA_EMAIL, pw = process.env.QA_PW || 'QaPass123!';
  await ctx.clearCookies();
  await page.goto('https://airion-cargo.store/login', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(2500);
  await page.fill('input[type=email]', email);
  await page.fill('input[type=password]', pw);
  await page.click('button[type=submit]');
  await page.waitForTimeout(6000);
  return await page.evaluate(async () => {
    const me = await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const ws = await (await fetch('/api/v1/users/me/workspaces',{credentials:'include'})).json();
    const list = (ws.workspaces||ws.items||ws.data||[]);
    return {email: me.email, name: me.name,
            workspaces: list.map(w => w.id + ' / ' + w.name),
            url: location.pathname};
  });
};
