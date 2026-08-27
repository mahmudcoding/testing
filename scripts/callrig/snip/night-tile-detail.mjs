export default async ({page}) => page.evaluate(()=>
  [...document.querySelectorAll('[data-testid="participant-tile"]')].map(t=>{
    const n=t.querySelector('[data-testid="participant-name"]');
    return {name:n?n.innerText.trim():'?',
      fullText:(t.innerText||'').replace(/\n+/g,' | ').slice(0,70),
      marks:[...t.querySelectorAll('[data-testid],[aria-label],[title]')]
        .map(e=>e.getAttribute('data-testid')||e.getAttribute('aria-label')||e.getAttribute('title'))
        .filter(Boolean).slice(0,5)};}));
