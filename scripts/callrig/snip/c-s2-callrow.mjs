export default async ({page}) => {
  const out={dms:[]};
  const dms=await page.evaluate(()=>[...document.querySelectorAll('a[href*="/d/"]')]
    .filter(a=>a.getBoundingClientRect().height>0).map(a=>a.getAttribute('href')));
  for (const href of dms.slice(0,4)){
    await page.goto('https://airion-cargo.store'+href);
    await page.waitForTimeout(5000);
    const info=await page.evaluate(()=>{
      const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<2||r.height<2) return false;
        let op=1,n=el; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
          if(cs.display==='none'||cs.visibility==='hidden') return false;
          op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>=0.05;};
      const rows=[];
      for (const el of document.querySelectorAll('main [data-message-id]')){
        const t=(el.innerText||'').replace(/\s+/g,' ');
        const isCall=/call/i.test(t);
        const times=[...el.querySelectorAll('*')].filter(e=>e.children.length===0).filter(vis)
          .map(e=>(e.textContent||'').trim()).filter(x=>/\d{1,2}:\d{2}/.test(x)&&x.length<32);
        rows.push({isCall, txt:t.slice(0,58), times});
      }
      return {path:location.pathname.slice(-14), rows:rows.slice(-8)};
    });
    out.dms.push(info);
  }
  return out;
};
