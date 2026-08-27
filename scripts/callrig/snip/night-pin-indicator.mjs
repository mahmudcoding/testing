export default async ({page}) => {
  return await page.evaluate(() => {
    const tiles=[...document.querySelectorAll('[data-testid="participant-tile"]')];
    const big = tiles.sort((a,b)=>{const ra=a.getBoundingClientRect(),rb=b.getBoundingClientRect();return rb.width*rb.height-ra.width*ra.height;})[0];
    const vt = document.querySelector('[data-testid="call-view-toggle"]');
    return {
      stageText: big ? big.innerText.replace(/\n+/g,' | ').slice(0,200) : null,
      stageHtmlHasPin: big ? /pin/i.test(big.innerHTML) : null,
      stageAriaLabels: big ? [...big.querySelectorAll('[aria-label]')].map(e=>e.getAttribute('aria-label')).slice(0,10) : [],
      viewToggle: vt ? {label:vt.getAttribute('aria-label'), title:vt.getAttribute('title'), disabled:vt.disabled, pressed:vt.getAttribute('aria-pressed')} : null,
      bodyMentionsPin: (document.body.innerText.match(/.{0,50}pin.{0,50}/gi)||[]).slice(0,4),
      pinTestids: [...document.querySelectorAll('[data-testid*="pin" i]')].map(e=>e.getAttribute('data-testid'))
    };
  });
};
