export default async ({page}) => {
  const out={marks:[]};
  const mark=(n)=>out.marks.push({n,at:Date.now()});
  const snap = async ()=> await page.evaluate(()=>{
    const vis = el=>{if(!el)return false;const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>/record|stop in/i.test((x.getAttribute('aria-label')||'')+' '+(x.innerText||'')))
      .map(x=>({l:(x.getAttribute('aria-label')||x.innerText||'').trim().replace(/\s+/g,' '),tid:x.dataset.testid||null}));
    const badge=document.querySelector('[data-testid="call-recording-badge"]');
    return {b, badge: vis(badge)?(badge.innerText||'').trim():null};
  });
  // 1. start
  mark('clickRecord');
  await page.locator('[data-testid="recording-start-access-trigger"]').first().click();
  await page.waitForTimeout(2000);
  out.dlgSeen = await page.evaluate(()=>!![...document.querySelectorAll('[role=dialog]')].find(d=>/Recording access/.test(d.innerText||'')));
  await page.locator('button', {hasText:/^Start recording$/}).last().click();
  mark('clickedStartRecording');
  await page.waitForTimeout(30000);
  out.midCycle = await snap();
  // 2. stop
  mark('clickStop');
  await page.locator('[data-testid="call-controls-record"]').first().click();
  await page.waitForTimeout(1500);
  out.afterStop = await snap();
  mark('afterStopSnap');
  // 3. immediately press Record again, inside the ~20s window
  const rec = page.locator('button[aria-label="Record"]').first();
  out.recCountInWindow = await rec.count();
  out.recTidInWindow = await rec.getAttribute('data-testid').catch(()=>null);
  if (out.recCountInWindow){
    mark('clickRecordAgain');
    await rec.click();
    await page.waitForTimeout(2500);
    out.dlgSeen2 = await page.evaluate(()=>{
      const d=[...document.querySelectorAll('[role=dialog]')].find(d=>/Recording access/.test(d.innerText||''));
      return d? (d.innerText||'').replace(/\s+/g,' ').slice(0,120) : null;});
    out.afterRecAgain = await snap();
    out.toasts = await page.evaluate(()=>[...document.querySelectorAll('[data-sonner-toast]')].map(t=>(t.innerText||'').replace(/\s+/g,' ').trim().slice(0,100)));
  }
  return out;
};
