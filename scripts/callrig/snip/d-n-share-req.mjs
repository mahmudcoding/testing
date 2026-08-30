export default async ({page}) => {
  const out={marks:[]};
  const mark=n=>out.marks.push({n,at:Date.now()});
  // close panels so the toolbar is clickable
  for (const t of ['call-controls-chat-toggle','call-controls-people-toggle','call-controls-settings-toggle']) {
    const b = page.locator(`[data-testid="${t}"]`);
    if (await b.count()>0 && await b.first().getAttribute('aria-pressed')==='true'){ await b.first().click(); await page.waitForTimeout(1000); }
  }
  const btn = page.locator('[data-testid="call-controls-screen-share"]').first();
  out.found = await btn.count();
  if(!out.found) return out;
  out.label0 = await btn.getAttribute('aria-label');
  mark('click');
  await btn.click();
  // watch own state for 30s
  const changes=[]; let prev=null; const t0=Date.now();
  while(Date.now()-t0<30000){
    const s = await page.evaluate(()=>{
      const vis = el=>{if(!el)return false;const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
        let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
      const b=document.querySelector('[data-testid="call-controls-screen-share"]');
      const toasts=[...document.querySelectorAll('[data-sonner-toast]')].filter(vis).map(t=>(t.innerText||'').replace(/\s+/g,' ').trim().slice(0,100));
      const dlgs=[...document.querySelectorAll('[role=dialog]')].filter(d=>{const r=d.getBoundingClientRect();return r.width>1&&r.width<900;}).map(d=>(d.innerText||'').replace(/\s+/g,' ').slice(0,200));
      return {btn: b?{l:b.getAttribute('aria-label'),dis:b.disabled||b.getAttribute('aria-disabled'),pressed:b.getAttribute('aria-pressed'),data:b.getAttribute('data-active')}:null, toasts, dlgs};
    });
    const k=JSON.stringify(s); if(k!==prev){changes.push({at:Date.now(),...s}); prev=k;}
    await page.waitForTimeout(400);
  }
  out.changes=changes;
  return out;
};
