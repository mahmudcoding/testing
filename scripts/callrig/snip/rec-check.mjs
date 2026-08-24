export default async ({page}) => await page.evaluate(() => {
  const s = document.querySelector('[data-testid="call-overlay-expanded"]') || document.body;
  return {
    text: s.innerText.replace(/\n+/g,' | ').slice(0,400),
    recEls: [...document.querySelectorAll('[aria-label*="ecord" i],[data-testid*="ecord" i]')].map(e=>`${e.tagName}|${e.getAttribute('data-testid')||''}|${e.getAttribute('aria-label')||''}|${(e.innerText||'').trim().slice(0,40)}`).slice(0,10),
    toasts: [...document.querySelectorAll('[role="status"],[role="alert"]')].map(e=>e.innerText.trim().slice(0,120)).filter(Boolean)
  };
});
