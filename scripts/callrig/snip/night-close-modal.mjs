export default async ({page}) => {
  const out=[];
  for (let i=0;i<4;i++){
    const dlgs = await page.$$('[role="dialog"]');
    // find a modal that is NOT the call overlay
    let target=null;
    for (const d of dlgs) { const tid = await d.getAttribute('data-testid'); if (tid !== 'call-overlay-expanded') target=d; }
    if (!target) break;
    const btns = await target.$$('button');
    let done=false;
    for (const b of btns) { const l=((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim(); if (/^(Close|Cancel)$/i.test(l)) { await b.click(); out.push('closed via '+l); done=true; break; } }
    if (!done) { await page.keyboard.press('Escape'); out.push('escape'); }
    await page.waitForTimeout(1200);
  }
  const left = await page.evaluate(()=>[...document.querySelectorAll('[role="dialog"]')].map(d=>d.getAttribute('data-testid')||d.innerText.slice(0,40).replace(/\n+/g,' ')));
  return {out, dialogsLeft: left};
};
