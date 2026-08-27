export default async ({page}) => {
  return await page.evaluate(async ()=>{
    const seen=[]; const t0=Date.now(); let last='';
    while(Date.now()-t0 < 24000){
      const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
      const marks=[...r.querySelectorAll('*')].filter(e=>{
        const own=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('');
        const cls=(e.className||'').toString();
        const tid=e.getAttribute&&e.getAttribute('data-testid')||'';
        return /[\u{270B}\u{1F91A}\u{1F590}]/u.test(own) || /raised|raise.?hand/i.test(own)
               || /hand/i.test(cls) || /hand/i.test(tid);
      }).map(e=>{const q=e.getBoundingClientRect();
        return ((e.getAttribute&&e.getAttribute('data-testid'))||'')+'|'+(e.className||'').toString().slice(0,40)
               +'|'+(e.textContent||'').trim().slice(0,24)+'|'+Math.round(q.width)+'x'+Math.round(q.height);});
      const panel=(document.querySelector('[data-testid="call-side-panel-slot"]')||{innerText:''}).innerText.replace(/\s+/g,' ').slice(0,180);
      const k=JSON.stringify([marks,panel]);
      if(k!==last){ seen.push({t:Date.now()-t0, marks:marks.slice(0,5), panel}); last=k; }
      await new Promise(x=>setTimeout(x,250));
    }
    return seen;
  });
};
