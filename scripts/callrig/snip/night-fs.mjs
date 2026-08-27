export default async ({page}) => {
  const before = await page.evaluate(()=>({
    fsEl: document.fullscreenElement ? (document.fullscreenElement.getAttribute('data-testid')||document.fullscreenElement.tagName) : null,
    btn: (b=>b?{l:b.getAttribute('aria-label'),p:b.getAttribute('aria-pressed')}:null)(document.querySelector('[data-testid="call-surface-fullscreen"]')),
    innerW: innerWidth, innerH: innerHeight,
    surface: (s=>s?(r=>({w:Math.round(r.width),h:Math.round(r.height)}))(s.getBoundingClientRect()):null)(document.querySelector('[data-testid="call-surface"]'))
  }));
  await page.locator('[data-testid="call-surface-fullscreen"]').click();
  await page.waitForTimeout(3000);
  const after = await page.evaluate(()=>({
    fsEl: document.fullscreenElement ? (document.fullscreenElement.getAttribute('data-testid')||document.fullscreenElement.tagName) : null,
    btn: (b=>b?{l:b.getAttribute('aria-label'),p:b.getAttribute('aria-pressed')}:null)(document.querySelector('[data-testid="call-surface-fullscreen"]')),
    innerW: innerWidth, innerH: innerHeight,
    surface: (s=>s?(r=>({w:Math.round(r.width),h:Math.round(r.height)}))(s.getBoundingClientRect()):null)(document.querySelector('[data-testid="call-surface"]')),
    toolbarVisible: (t=>t?t.getBoundingClientRect().height>0:false)(document.querySelector('[data-testid="call-toolbar"]')),
    tiles: [...document.querySelectorAll('[data-testid="participant-tile"]')].map(t=>{const r=t.getBoundingClientRect();return {w:Math.round(r.width),h:Math.round(r.height)};})
  }));
  return {before, after};
};
