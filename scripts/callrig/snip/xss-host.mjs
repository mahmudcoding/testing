export default async ({page}) => await page.evaluate(()=>({
  xssMarker: !!window.__XSS2,
  injectedImgs: [...document.querySelectorAll('img[src="x"]')].length,
  panelText: (document.querySelector('[data-testid="participants-list-panel"]')||document.body).innerText.replace(/\n+/g,' | ').slice(0,300),
  literal: [...document.querySelectorAll('*')].filter(e=>e.children.length===0 && /onerror/i.test(e.textContent||'')).map(e=>e.tagName+': '+e.textContent.slice(0,70)).slice(0,3),
  admitLabels: [...document.querySelectorAll('button[aria-label]')].map(b=>b.getAttribute('aria-label')).filter(l=>/Admit|Deny/.test(l)).slice(0,3)
}));
