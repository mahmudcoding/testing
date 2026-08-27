export default async ({page}) => {
  const out={};
  // back to hub via PiP minimize
  await page.evaluate(()=>{ const b=document.querySelector('[data-testid="call-surface-minimize"]'); if(b) b.click(); });
  await page.waitForTimeout(2500);
  out.url0 = page.url();
  // CONTROL: click a neutral hub control (the "All · N" tab) — does the router also jump to /call/ ?
  const ctrl = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0 && /^All · \d+$/.test((x.innerText||'').trim()))[0];
    if(!b) return null; b.scrollIntoView({block:'center'});
    const r=b.getBoundingClientRect(); const cx=r.left+r.width/2, cy=r.top+r.height/2;
    const top=document.elementFromPoint(cx,cy);
    return {cx:Math.round(cx),cy:Math.round(cy), topmostIsButton: top===b||b.contains(top)};
  });
  out.ctrlProbe = ctrl;
  if (ctrl && ctrl.topmostIsButton) { await page.mouse.click(ctrl.cx, ctrl.cy); await page.waitForTimeout(3500); }
  out.urlAfterNeutralClick = page.url();
  // persistence: is the scheduled card still offering Start call after ~45 s without reload?
  out.t0 = await page.evaluate(()=>{ const t=document.body.innerText.replace(/\s+/g,' '); return (t.match(/Scheduled today.{0,120}/)||[])[0]||null; });
  await page.waitForTimeout(45000);
  out.t45 = await page.evaluate(()=>{ const t=document.body.innerText.replace(/\s+/g,' '); return (t.match(/Scheduled today.{0,120}/)||[])[0]||null; });
  out.urlAt45 = page.url();
  // now reload and see what the same card shows
  await page.goto('https://staging.airion-cargo.store/w/W4QBF1XTURESO01/calls', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  out.afterReload = await page.evaluate(()=>{ const t=document.body.innerText.replace(/\s+/g,' ');
    return { live:(t.match(/Live now.{0,140}/)||[])[0]||null, sched:(t.match(/Scheduled today.{0,180}/)||[])[0]||null,
             startCallBtns:[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0 && /^Start call$/i.test((x.innerText||'').trim())).length }; });
  return out;
};
