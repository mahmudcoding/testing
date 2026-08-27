export default async ({page}) => {
  const out={};
  const open = await page.evaluate(()=>{ const b=document.querySelector('[data-testid="call-controls-breakout-rooms"]'); return b? b.getAttribute('aria-pressed'):null; });
  out.togglePressed = open;
  if (open !== 'true') { await page.evaluate(()=>{ const b=document.querySelector('[data-testid="call-controls-breakout-rooms"]'); if(b) b.click(); }); await page.waitForTimeout(3000); }
  out.all = await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const a=document.querySelector('aside');
    return {asideText: a? a.innerText.replace(/\s+/g,' ').slice(0,500):null,
      btns:[...document.querySelectorAll('button')].filter(vis).map(b=>({t:(b.innerText||'').trim().slice(0,30),al:b.getAttribute('aria-label'),tid:b.getAttribute('data-testid')})).filter(b=>/room|new|create|assign|move/i.test((b.t||'')+(b.al||'')+(b.tid||'')))};
  });
  return out;
};
