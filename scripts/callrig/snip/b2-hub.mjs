export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/calls', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const out = await page.evaluate(() => {
    const main = document.querySelector('main') || document.body;
    const btns = [...main.querySelectorAll('button,a[href],[role="tab"]')]
      .filter(b => b.offsetParent !== null)
      .map(b => ({t:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,44), tag:b.tagName, sel:b.getAttribute('aria-selected'), tid:b.getAttribute('data-testid')}))
      .filter(x=>x.t);
    const rows = [...main.querySelectorAll('[data-testid*="call"],[data-testid*="recent"]')].map(e=>e.getAttribute('data-testid'));
    const uniq = [...new Set(rows)];
    return {btns: btns.slice(0,45), testids: uniq.slice(0,20), textLen: main.innerText.length};
  });
  const hist = await page.evaluate(async () => {
    const r = await fetch('/api/v1/meetings/history?limit=100', {credentials:'include'});
    const j = await r.json().catch(()=>null);
    const arr = j?.data ?? j?.meetings ?? j?.items ?? (Array.isArray(j)?j:null);
    return {status:r.status, keys: j?Object.keys(j).slice(0,8):null, n: Array.isArray(arr)?arr.length:null, next: j?.next_cursor ?? j?.data?.next_cursor ?? null};
  });
  return {url: page.url(), ...out, hist};
};
