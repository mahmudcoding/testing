export default async ({page}) => await page.evaluate(() => {
  const s = document.querySelector('[data-testid="call-side-panel-slot"]') || document.querySelector('[data-testid="call-overlay-expanded"]') || document.body;
  return {
    text: s.innerText.replace(/\n+/g,' | ').slice(0,700),
    buttons: [...s.querySelectorAll('button')].map(b=>{const r=b.getBoundingClientRect(); return `${(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,35)}#${b.getAttribute('data-testid')||'-'}@${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}`;})
  };
});
