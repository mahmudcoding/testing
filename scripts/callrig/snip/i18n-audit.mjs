export default async ({page}) => await page.evaluate(()=>{
  const ov = document.querySelector('[data-testid="call-overlay-expanded"]');
  if (!ov) return {noOverlay:true, body: document.body.innerText.replace(/\n+/g,' | ').slice(0,300)};
  const labels = [...ov.querySelectorAll('button,[aria-label]')].map(e=>e.getAttribute('aria-label')||'').filter(Boolean);
  const texts = [...ov.querySelectorAll('*')].filter(e=>e.children.length===0 && (e.textContent||'').trim()).map(e=>e.textContent.trim());
  const latin = s => /[A-Za-z]{3,}/.test(s) && !/^[A-Z0-9\-_.]+$/.test(s);
  // clipped leaf nodes actually visible
  const clipped = [...ov.querySelectorAll('*')].filter(e=>{
    if (e.children.length) return false;
    const r=e.getBoundingClientRect();
    return e.scrollWidth > e.clientWidth+1 && e.clientWidth>20 && r.width>20 && r.height>0;
  }).map(e=>({t:(e.textContent||'').trim().slice(0,50), sw:e.scrollWidth, cw:e.clientWidth}));
  return {
    lang: document.documentElement.lang,
    untranslatedLabels: [...new Set(labels.filter(latin))].slice(0,30),
    untranslatedTexts: [...new Set(texts.filter(latin))].slice(0,30),
    clipped: clipped.slice(0,12),
    sample: ov.innerText.replace(/\n+/g,' | ').slice(0,400)
  };
});
