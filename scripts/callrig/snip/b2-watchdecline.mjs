// Waits for the incoming-call overlay, clicks Decline (or Accept via QA_ACT), returns a timeline.
export default async ({page}) => {
  const ACT = process.env.QA_ACT || 'Decline';
  const secs = Number(process.env.QA_POLL_SECS || 90);
  const t0=Date.now(); const tl=[]; let last=''; let done=null;
  while((Date.now()-t0)/1000 < secs){
    const s = await page.evaluate((act)=>{
      const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
      const fixed=[...document.body.querySelectorAll('div,section,aside')].filter(e=>{const c=getComputedStyle(e); return (c.position==='fixed'||c.position==='absolute') && v(e) && (e.innerText||'').trim().length>8 && (e.innerText||'').length<300;}).map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,120));
      const btn=[...document.querySelectorAll('button')].filter(v).find(b=>(b.innerText||'').trim()===act);
      let clicked=null;
      if(btn){ btn.click(); clicked=act; }
      return {fixed:[...new Set(fixed)].slice(0,4), clicked,
              inc:[...document.querySelectorAll('[data-testid^="incoming-call"]')].filter(v).length};
    }, ACT).catch(e=>({err:String(e).slice(0,50)}));
    const sig=JSON.stringify(s.fixed)+s.inc;
    if(sig!==last){ tl.push({t:+((Date.now()-t0)/1000).toFixed(1), ...s}); last=sig; }
    if(s.clicked){ done={t:+((Date.now()-t0)/1000).toFixed(1), act:s.clicked}; await page.waitForTimeout(4000);
      const post=await page.evaluate(()=>{
        const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
        const fixed=[...document.body.querySelectorAll('div,section,aside')].filter(e=>{const c=getComputedStyle(e); return (c.position==='fixed'||c.position==='absolute') && v(e) && (e.innerText||'').trim().length>8 && (e.innerText||'').length<300;}).map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,120));
        return {url:location.href, fixed:[...new Set(fixed)].slice(0,4)};
      });
      return {tl: tl.slice(0,10), done, post};
    }
    await page.waitForTimeout(300);
  }
  return {tl: tl.slice(0,10), done, timedOut:true};
};
