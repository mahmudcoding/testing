export default async ({page}) => page.evaluate(()=>
  [...document.querySelectorAll('[data-testid="participant-tile"]')].map(t=>{
    const n=t.querySelector('[data-testid="participant-name"]');
    return {name:n?n.innerText.trim():'?',
      txt:t.innerText.replace(/\n+/g,' | ').slice(0,60),
      muteIcons:[...t.querySelectorAll('[data-testid*="mut"],[aria-label*="ute"],[title*="ute"]')]
        .map(e=>(e.getAttribute('data-testid')||e.getAttribute('aria-label')||e.getAttribute('title'))).slice(0,3)};
  }));
