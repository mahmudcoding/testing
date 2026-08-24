export default async ({page}) => {
  const r = {};
  r.pressed = await page.evaluate(()=>{const b=document.querySelector('[data-testid="call-nerd-stats-toggle"]'); return b?b.getAttribute('aria-pressed'):null;});
  r.raw = await page.evaluate(()=>{
    const t=document.querySelector('[data-testid="live-stats-tile"]');
    if(!t) return null;
    const cs=getComputedStyle(t); const rect=t.getBoundingClientRect();
    return {htmlLen:t.innerHTML.length, html:t.innerHTML.slice(0,600), disp:cs.display, vis:cs.visibility, op:cs.opacity,
            w:Math.round(rect.width), h:Math.round(rect.height)};
  });
  // hover the first participant tile then re-read
  const tile = await page.$('[data-testid="participant-tile"]');
  if (tile) { const bb = await tile.boundingBox(); if (bb) { await page.mouse.move(bb.x+bb.width/2, bb.y+bb.height/2); await page.waitForTimeout(2500); } }
  r.afterHover = await page.evaluate(()=>[...document.querySelectorAll('[data-testid="live-stats-tile"]')].map(t=>t.innerText.replace(/\n+/g,' | ').slice(0,240)));
  r.numbersAnywhere = await page.evaluate(()=>{
    const ov=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    return [...ov.querySelectorAll('*')].filter(e=>e.children.length===0 && /\b\d+\s?(kbps|kb\/s|ms|fps|dB)\b/i.test(e.textContent||'')).map(e=>e.textContent.trim().slice(0,50)).slice(0,10);
  });
  return r;
};
