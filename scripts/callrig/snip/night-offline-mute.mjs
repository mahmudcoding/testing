export default async ({page, ctx}) => {
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  const btn = async () => await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')]
      .find(x=>/^(Mute|Unmute)$/.test((x.getAttribute('aria-label')||'').trim()));
    return b?{label:b.getAttribute('aria-label'), pressed:b.getAttribute('aria-pressed'), disabled:b.disabled}:null;
  });
  const out={before: await btn()};
  await cdp.send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});
  await page.waitForTimeout(2000);
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button')]
    .find(x=>/^Mute$/.test((x.getAttribute('aria-label')||'').trim())); if(b) b.click();});
  await page.waitForTimeout(2500);
  out.afterClickOffline = await btn();
  out.toastsOffline = await page.evaluate(()=>[...document.querySelectorAll('[role="status"],[role="alert"],[data-testid*="toast"]')]
    .map(e=>e.innerText.replace(/\n+/g,' ').trim().slice(0,70)).filter(Boolean));
  await page.waitForTimeout(12000);
  out.stillOffline = await btn();
  await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});
  await page.waitForTimeout(12000);
  out.afterRestore = await btn();
  out.toastsAfter = await page.evaluate(()=>[...document.querySelectorAll('[role="status"],[role="alert"],[data-testid*="toast"]')]
    .map(e=>e.innerText.replace(/\n+/g,' ').trim().slice(0,70)).filter(Boolean));
  return out;
};
