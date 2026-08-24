export default async ({page}) => {
  await page.waitForTimeout(500);
  return await page.evaluate(() => {
    const m = document.querySelector('main') || document.body;
    return {
      url: location.href,
      buttons: [...m.querySelectorAll('button,[role=button]')].map(b=>({
        l:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,45),
        t:b.getAttribute('data-testid'), d:b.disabled===true, ap:b.getAttribute('aria-disabled'),
        op: getComputedStyle(b).opacity, pe: getComputedStyle(b).pointerEvents
      })).filter(x=>x.l||x.t).slice(0,40),
      tabs: [...document.querySelectorAll('[role="tab"]')].map(t=>({l:t.textContent.trim(), sel:t.getAttribute('aria-selected')})),
      testids: [...new Set([...m.querySelectorAll('[data-testid]')].map(e=>e.getAttribute('data-testid')))].slice(0,60)
    };
  });
};
