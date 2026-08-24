export default async ({page}) => {
  const t = page.locator('[data-testid="call-controls-people-toggle"]');
  if (await t.count() && (await t.getAttribute('aria-pressed'))!=='true') { await t.click(); await page.waitForTimeout(2500); }
  return await page.evaluate(() => {
    const s=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const panel=[...s.querySelectorAll('aside,[data-testid*="people"],[data-testid*="participant"]')].pop()||s;
    return {badge: (document.querySelector('[data-testid="call-controls-waiting-count"]')||{}).textContent,
      text: panel.innerText.replace(/\n+/g,' | ').slice(0,700),
      buttons: [...panel.querySelectorAll('button')].map(b=>`${(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,32)}#${b.getAttribute('data-testid')||'-'}`).filter(x=>!/^#-$/.test(x)),
      bulk: [...panel.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim()).filter(t=>/all/i.test(t))};
  });
};
