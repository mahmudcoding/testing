// Reads the in-call duration badge, so recording start/stop can be pinned to call time.
export default async ({page}) => {
  return await page.evaluate(()=>{
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const d=[...document.querySelectorAll('[data-testid="call-duration"]')].filter(v).pop();
    const badge=[...document.querySelectorAll('[data-testid="call-recording-badge"]')].filter(v).pop();
    return {callClock: d?(d.innerText||'').trim():null, recordingBadge: badge?(badge.innerText||'').replace(/\s+/g,' ').trim():null,
            wall: new Date().toISOString()};
  });
};
