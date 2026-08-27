export default async ({page}) => {
  return await page.evaluate(async ()=>{
    const out=[]; const t0=Date.now();
    const snap=()=>{
      const m=document.querySelector('[data-testid="lobby-audio-meter"]');
      if(!m) return 'absent';
      // capture anything that could encode level: width/style/aria
      const kids=[...m.querySelectorAll('*')].map(e=>{
        const s=e.getAttribute('style')||''; const w=Math.round(e.getBoundingClientRect().width);
        return s.slice(0,60)+'|w'+w;
      });
      return JSON.stringify({aria:m.getAttribute('aria-valuenow'), txt:(m.innerText||'').slice(0,20), kids:kids.slice(0,6)});
    };
    let last=null;
    while(Date.now()-t0<8000){
      const c=snap(); if(c!==last){ out.push({at:Math.round((Date.now()-t0)/100)/10+'s', s:c.slice(0,220)}); last=c; }
      await new Promise(r=>setTimeout(r,200));
    }
    return {changes: out.length, samples: out.slice(0,6)};
  });
};
