export default async ({page, ctx}) => {
  const timeline=[];
  const snap = async (t) => {
    const s = await page.evaluate(()=>{
      const ov=document.querySelector('[data-testid="call-overlay-expanded"]');
      return {online: navigator.onLine,
              text: ov? ov.innerText.replace(/\n+/g,' | ').slice(0,260) : (document.body.innerText.replace(/\n+/g,' | ').slice(0,200)),
              toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].map(e=>e.innerText.trim()).filter(Boolean).slice(0,4),
              netInd: (document.querySelector('[data-testid="call-network-indicator"]')||{innerText:''}).innerText.replace(/\n+/g,' ').slice(0,60)};
    });
    timeline.push([t, s]);
  };
  await snap('before');
  await ctx.setOffline(true);
  for (const s of [3,8,15]) { await page.waitForTimeout(s*1000 - (s===3?0:(s===8?3000:8000))); await snap(`offline+${s}s`); }
  await ctx.setOffline(false);
  for (const s of [3,10,20]) { await page.waitForTimeout(s*1000 - (s===3?0:(s===10?3000:10000))); await snap(`online+${s}s`); }
  return timeline;
};
