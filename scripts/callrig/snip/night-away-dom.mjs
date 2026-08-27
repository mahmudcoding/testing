export default async ({page}) => {
  return await page.evaluate(()=>{
    const hits=[...document.querySelectorAll('[data-testid*="away" i],[data-testid*="brb" i],[data-testid*="break" i],[aria-label*="away" i],[aria-label*="be right back" i],[aria-label*="break" i]')]
      .map(e=>{const r=e.getBoundingClientRect();return {t:e.getAttribute('data-testid'),aria:e.getAttribute('aria-label'),vis:r.width>0&&r.height>0,w:Math.round(r.width),h:Math.round(r.height),txt:(e.innerText||'').slice(0,40)};});
    // also look at Carol's tile in detail
    const tiles=[...document.querySelectorAll('[data-testid="participant-tile"]')].map(t=>{
      const n=t.querySelector('[data-testid="participant-name"]');
      return {name:n?n.innerText.trim():'?', testids:[...t.querySelectorAll('[data-testid]')].map(e=>e.getAttribute('data-testid')),
        arias:[...t.querySelectorAll('[aria-label]')].map(e=>e.getAttribute('aria-label'))};
    });
    return {awayHits: hits, tiles, bodyAway:(document.body.innerText.match(/.{0,40}(away|right back|break).{0,40}/gi)||[]).slice(0,4)};
  });
};
