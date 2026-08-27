export default async ({page}) => {
  return await page.evaluate(()=>{
    const out=[];
    document.querySelectorAll('[aria-label="Hand raised"],[data-testid="participant-hand-raised"]').forEach(e=>{
      const r=e.getBoundingClientRect();
      // find owning tile or row
      let n=e, owner='?';
      for(let k=0;k<10&&n;k++,n=n.parentElement){
        if(n.getAttribute && n.getAttribute('data-testid')==='participant-tile'){ const nm=n.querySelector('[data-testid="participant-name"]'); owner='tile:'+(nm?nm.innerText.trim():'?'); break; }
        const txt=(n.innerText||'').replace(/\n+/g,' ').trim();
        if(txt && txt.length<40 && /QA /.test(txt)){ owner='row:'+txt; break; }
      }
      out.push({testid:e.getAttribute('data-testid'), aria:e.getAttribute('aria-label'), owner,
        visible: r.width>0&&r.height>0, rect:{w:Math.round(r.width),h:Math.round(r.height)}});
    });
    return out;
  });
};
