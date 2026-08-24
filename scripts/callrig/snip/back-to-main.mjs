export default async ({page}) => {
  const tabs = await page.evaluate(() => {
    const t = document.querySelector('[data-testid="call-header-tabs"]');
    return t? [...t.querySelectorAll('button')].map(b=>`${(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,40)}#${b.getAttribute('data-testid')||'-'}|sel=${b.getAttribute('aria-selected')||b.getAttribute('data-state')}`) : 'no tabs';
  });
  const mainTab = page.locator('[data-testid="call-header-tabs"] button').first();
  await mainTab.click();
  await page.waitForTimeout(4000);
  return {tabs, after: await page.evaluate(() => ({
    tabs: (document.querySelector('[data-testid="call-header-tabs"]')||{innerText:''}).innerText.replace(/\n+/g,' | ').slice(0,140),
    toolbar: [...(document.querySelector('[data-testid="call-toolbar"]')||document.body).querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||'').slice(0,30)).filter(Boolean),
    text: (document.querySelector('[data-testid="call-overlay-expanded"]')||document.body).innerText.replace(/\n+/g,' | ').slice(0,250)
  }))};
};
