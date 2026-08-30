export default async ({page}) => {
  const out={};
  const b = page.locator('[data-testid="call-controls-record"]').first();
  out.pre = await b.innerText().catch(()=>null);
  out.preLabel = await b.getAttribute('aria-label');
  const t0=Date.now();
  await b.click();
  // watch the button + any dialog for 45s
  const changes=[]; let prev=null;
  while(Date.now()-t0<45000){
    const s = await page.evaluate(()=>{
      const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
        let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
      const btn=[...document.querySelectorAll('button')].filter(vis).filter(x=>/record|stop in/i.test((x.getAttribute('aria-label')||'')+' '+(x.innerText||'')))
        .map(x=>({l:(x.getAttribute('aria-label')||x.innerText||'').trim().replace(/\s+/g,' '),tid:x.dataset.testid||null}));
      const badge=document.querySelector('[data-testid="call-recording-badge"]');
      const ds=[...document.querySelectorAll('[role=dialog]')].filter(d=>{const r=d.getBoundingClientRect(); return r.width>1&&r.width<900;})
        .map(d=>(d.innerText||'').replace(/\s+/g,' ').slice(0,200));
      const recText=[...new Set([...document.querySelectorAll('*')].filter(e=>e.children.length===0&&e.innerText&&/record/i.test(e.innerText)&&vis(e)).map(e=>e.innerText.replace(/\s+/g,' ').trim().slice(0,60)))];
      return {btn, badge: badge?(badge.innerText||'').trim():null, ds, recText};
    });
    const k=JSON.stringify(s); if(k!==prev){changes.push({ms:Date.now()-t0,...s}); prev=k;}
    await page.waitForTimeout(400);
  }
  out.changes=changes;
  return out;
};
