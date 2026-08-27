// Polls the current page ~300ms for N seconds, returns a timeline of changes.
export default async ({page}) => {
  const secs = Number(process.env.QA_POLL_SECS || 70);
  const t0 = Date.now();
  const seen = [];
  let last = '';
  while ((Date.now() - t0) / 1000 < secs) {
    const s = await page.evaluate(() => {
      const vis = el => { if(!el) return false; let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*= parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
      const ids = [...new Set([...document.querySelectorAll('[data-testid]')].filter(vis).map(e=>e.getAttribute('data-testid')).filter(t=>/call|lobby|meet|join|wait|ended|taken|recover|banner|toast|notice/i.test(t)))];
      const main = document.querySelector('main')||document.body;
      const btns = [...main.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ')).filter(Boolean);
      const txt = (main.innerText||'').replace(/\n+/g,' | ').slice(0,300);
      return {url: location.href, ids, btns, txt, nvid: document.querySelectorAll('video').length};
    }).catch(e => ({err:String(e).slice(0,80)}));
    const sig = JSON.stringify(s);
    if (sig !== last) { seen.push({t: +((Date.now()-t0)/1000).toFixed(1), ...s}); last = sig; }
    await page.waitForTimeout(300);
  }
  return {samples: seen.length, timeline: seen.slice(0, 14)};
};
