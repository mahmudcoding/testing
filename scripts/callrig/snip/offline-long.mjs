export default async ({page, ctx}) => {
  const t=[];
  const snap = async (tag) => t.push([tag, await page.evaluate(()=>({
    online: navigator.onLine,
    ind: (document.querySelector('[data-testid="call-network-indicator"]')||{innerText:''}).innerText.replace(/\n+/g,' ').slice(0,50),
    toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].map(e=>e.innerText.trim().replace(/\n+/g,' ')).filter(Boolean).slice(0,3),
    tiles: document.querySelectorAll('[data-testid="participant-tile"]').length
  }))]);
  await snap('t=0 before');
  await ctx.setOffline(true);
  for (let i=1;i<=8;i++){ await page.waitForTimeout(5000); await snap(`offline ${i*5}s`); }
  await ctx.setOffline(false);
  await page.waitForTimeout(6000); await snap('online +6s');
  await page.waitForTimeout(10000); await snap('online +16s');
  return t;
};
