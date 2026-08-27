export default async ({page}) => {
  return await page.evaluate(()=>({
    handTestids: [...document.querySelectorAll('[data-testid*="hand" i]')].map(e=>({t:e.getAttribute('data-testid'), txt:(e.innerText||'').slice(0,40)})),
    bodyHand: (document.body.innerText.match(/.{0,40}hand.{0,40}/gi)||[]).slice(0,5),
    ariaHand: [...document.querySelectorAll('[aria-label*="hand" i]')].map(e=>e.getAttribute('aria-label')).slice(0,8)
  }));
};
