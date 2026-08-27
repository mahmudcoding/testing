// Trigger the DM-blocked path and measure EVERY notice rigorously:
// ancestor opacity chain + elementFromPoint at its own centre.
export default async ({page}) => {
  const who='QA Alice';
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/directories?tab=people',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  await page.evaluate(()=>{ window.__seen=[];
    window.__t=setInterval(()=>{
      for (const e of document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast],[role=dialog]')) {
        const r=e.getBoundingClientRect();
        let n=e, op=1, hidden=false;
        while(n && n!==document.documentElement){const c=getComputedStyle(n);
          if(c.display==='none'||c.visibility==='hidden'){hidden=true;break;} op*=parseFloat(c.opacity||'1'); n=n.parentElement;}
        const cx=r.left+r.width/2, cy=r.top+r.height/2;
        const top=(cx>=0&&cy>=0&&cx<innerWidth&&cy<innerHeight)?document.elementFromPoint(cx,cy):null;
        const rec={txt:(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,90),
          w:Math.round(r.width),h:Math.round(r.height),op:Number(op.toFixed(2)),hidden,
          cls:(typeof e.className==='string'?e.className:'').slice(0,45),
          role:e.getAttribute('role')||'toast',
          hitSelf: !!(top && (e===top || e.contains(top)))};
        if(!rec.txt) continue;
        const prev=window.__seen.find(s=>s.txt===rec.txt && s.role===rec.role);
        if(!prev) { rec.maxOp=rec.op; rec.everHit=rec.hitSelf; rec.samples=1; window.__seen.push(rec); }
        else { prev.maxOp=Math.max(prev.maxOp, rec.op); prev.everHit=prev.everHit||rec.hitSelf; prev.samples++; }
      }
    }, 200);
  });
  await page.waitForTimeout(500);
  await page.evaluate((who)=>{
    const nameNode=[...document.querySelectorAll('main *')].filter(e=>e.children.length===0 && (e.textContent||'').trim()===who)[0];
    let p=nameNode;
    for(let i=0;i<8&&p;i++,p=p.parentElement){
      const btn=[...p.querySelectorAll('button')].find(x=>/^Message$/.test(x.innerText.trim()));
      if(!btn) continue;
      const uniq=[...new Set((p.innerText||'').match(/QA [A-Z]\w+/g)||[])];
      if(uniq.length===1&&uniq[0]===who){ btn.click(); return; }
    }
  }, who);
  await page.waitForTimeout(6000);
  return await page.evaluate(()=>{clearInterval(window.__t); return window.__seen;});
};
