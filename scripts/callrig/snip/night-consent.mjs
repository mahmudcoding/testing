export default async ({page}) => await page.evaluate(()=>({
  url: location.href,
  consentTestids:[...document.querySelectorAll('[data-testid*="consent" i]')].map(e=>e.getAttribute('data-testid')),
  bodyConsent:(document.body.innerText.match(/.{0,60}(record|consent|transcri).{0,60}/gi)||[]).slice(0,5),
  checkboxes:[...document.querySelectorAll('input[type=checkbox]')].map(c=>({checked:c.checked, lab:(c.closest('label')||{}).innerText})),
  joinBtn:(b=>b?{label:b.getAttribute('aria-label')||b.textContent.trim(), disabled:b.disabled}:null)(document.querySelector('[data-testid="lobby-join"]'))
}));
