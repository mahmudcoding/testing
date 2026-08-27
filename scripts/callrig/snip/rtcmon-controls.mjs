export default async ({page}) => await page.evaluate(() =>
  [...document.querySelectorAll('button')]
    .filter(b => b.offsetParent)
    .map(b => ({ t:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,40),
                 id:b.getAttribute('data-testid'), pressed:b.getAttribute('aria-pressed') }))
    .filter(x => x.id && /call-control|camera|video|mic/i.test(x.id + ' ' + x.t))
);
