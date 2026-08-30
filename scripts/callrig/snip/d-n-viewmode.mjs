export default async ({page}) => await page.evaluate(()=>{
  const b=document.querySelector('[data-testid="call-view-toggle"]');
  return {toggleLabel:b?b.getAttribute('aria-label'):null, pressed:b?b.getAttribute('aria-pressed'):null,
    grid: !!document.querySelector('[data-testid*="grid"]'),
    surfaceTestids:[...new Set([...document.querySelectorAll('[data-testid]')].map(e=>e.dataset.testid).filter(t=>/grid|spotlight|layout|stage/i.test(t)))]};
});
