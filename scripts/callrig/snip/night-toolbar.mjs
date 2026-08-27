export default async ({page}) => {
  return await page.evaluate(() => {
    const tb = document.querySelector('[data-testid="call-toolbar"]');
    if (!tb) return {toolbar:false, url: location.href, txt:(document.querySelector('main')||document.body).innerText.slice(0,200)};
    return {toolbar:true, buttons: [...tb.querySelectorAll('button')].map(b=>({
      l:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,40), t:b.getAttribute('data-testid'), d:b.disabled}))};
  });
};
