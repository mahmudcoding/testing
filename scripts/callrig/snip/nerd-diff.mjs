export default async ({page}) => {
  const snap = async () => await page.evaluate(()=>({
    testids: [...document.querySelectorAll('[data-testid]')].map(e=>e.getAttribute('data-testid')).sort(),
    bodyLen: document.body.innerText.length,
    statsText: [...document.querySelectorAll('*')].filter(e=>e.children.length===0 && /kbps|kbit|fps|jitter|packet|bitrate|RTT|codec/i.test(e.textContent||'')).map(e=>e.textContent.trim().slice(0,60)).slice(0,10)
  }));
  const b = await page.$('[data-testid="call-nerd-stats-toggle"]');
  // ensure OFF
  if (b && (await b.getAttribute('aria-pressed'))==='true'){ await b.click(); await page.waitForTimeout(3000); }
  const off = await snap();
  await b.click(); await page.waitForTimeout(4500);
  const on = await snap();
  const added = on.testids.filter(t=>{ const i=off.testids.indexOf(t); if(i<0) return true; off.testids.splice(i,1); return false; });
  return {offCount: off.testids.length, onCount: on.testids.length, addedTestids:[...new Set(added)],
          offBodyLen: off.bodyLen, onBodyLen: on.bodyLen, statsTextOn: on.statsText, statsTextOff: off.statsText,
          pressedNow: await page.evaluate(()=>document.querySelector('[data-testid="call-nerd-stats-toggle"]').getAttribute('aria-pressed'))};
};
