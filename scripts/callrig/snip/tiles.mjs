export default async ({page}) => await page.evaluate(()=>
  [...document.querySelectorAll('[data-testid="participant-tile"]')].map(t=>({
    text: t.innerText.replace(/\n+/g,' | ').slice(0,80),
    marks: [...t.querySelectorAll('[aria-label]')].map(e=>e.getAttribute('aria-label')).filter(Boolean).slice(0,8)
  })));
