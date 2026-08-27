export default async ({ page }) => {
  await page.screenshot({ path: '/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/settings-account.png' });
  const d = await page.evaluate(() => {
    const vis = (el) => { const r = el.getBoundingClientRect(); if (r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05; };
    return {
      vp: [innerWidth, innerHeight],
      h1: [...document.querySelectorAll('h1,h2')].filter(vis).map(h=>h.innerText.trim().slice(0,50)).slice(0,8),
      buttons: [...document.querySelectorAll('button')].filter(vis).map(b=>({t:(b.innerText||'').trim().replace(/\s+/g,' ').slice(0,28), tid:b.getAttribute('data-testid')||'', dis:b.disabled})).slice(0,30),
      testids: [...new Set([...document.querySelectorAll('[data-testid]')].filter(vis).map(e=>e.getAttribute('data-testid')))].slice(0,40),
    };
  });
  return d;
};
