export default async ({page}) => await page.evaluate(() => {
  const tb = document.querySelector('[data-testid="call-toolbar"]');
  return {
    inSideRoom: (document.querySelector('[data-testid="call-header-tabs"]')||{innerText:''}).innerText.replace(/\n+/g,' | ').slice(0,120),
    toolbar: tb ? [...tb.querySelectorAll('button')].map(b=>`${(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,32)}#${b.getAttribute('data-testid')||'-'}`) : 'no toolbar',
    recBadge: !!document.querySelector('[data-testid="call-recording-badge"]'),
    anyRecordBtn: [...document.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||'')).filter(l=>/record/i.test(l))
  };
});
