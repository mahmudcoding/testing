export default async ({ page }) => {
  return await page.evaluate(async () => {
    const ws = 'W4QBF1XTURESO01';
    const g = async u => { const r = await fetch(u, {credentials:'include'});
      return { s: r.status, b: (await r.text()).slice(0, 420) }; };
    return {
      current: await g('/api/v1/meetings/current'),
      active:  await g(`/api/v1/workspace/${ws}/meetings/active`),
      notif:   await g('/api/v1/notifications?limit=3'),
    };
  });
};
