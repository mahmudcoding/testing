export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH', mid='M4OX0TTPGJCFW4G';
  const out={};
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const va=page.locator('main button, main [role="button"]').filter({hasText:/View all/i}).first();
  await va.click(); await page.waitForTimeout(2600);
  const jumps=page.locator('button[aria-label="Jump to pinned message"]');
  const n=await jumps.count();
  out.jumpButtons=[];
  for(let i=0;i<n;i++) out.jumpButtons.push((await jumps.nth(i).innerText()).replace(/\s+/g,' ').slice(0,34));
  // the panel's entry is the one WITHOUT the "Pinned message" banner prefix
  let idx=-1;
  for(let i=0;i<n;i++) if(!/^Pinned message/i.test(out.jumpButtons[i])) idx=i;
  out.chosenIndex=idx; out.chosenText=idx>=0?out.jumpButtons[idx]:null;
  if(idx<0) return out;
  await jumps.nth(idx).click();
  const marks=[];
  for(let i=0;i<20;i++){
    await page.waitForTimeout(1000);
    marks.push(await page.evaluate((mid)=>{
      const el=document.querySelector(`main [data-message-id="${mid}"]`);
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      const panelOpen=[...document.querySelectorAll('aside,[role="dialog"]')].filter(v)
        .some(d=>/Pinned messages/.test(d.innerText||''));
      return {loaded:document.querySelectorAll('main [data-message-id]').length,
        present:!!el, panelOpen,
        inView: el? (()=>{const r=el.getBoundingClientRect();
          return r.top>=-4&&r.bottom<=innerHeight+4;})() : false};}, mid));
    const l=marks[marks.length-1]; if(l.present&&l.inView&&i>=2) break;
  }
  out.result={waitedSec:marks.length, loaded:[...new Set(marks.map(m=>m.loaded))],
    panelClosed: marks.some(m=>!m.panelOpen),
    everPresent:marks.some(m=>m.present), everInView:marks.some(m=>m.inView)};
  return out;
};
