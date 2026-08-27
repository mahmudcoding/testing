export default async ({page}) => {
  const out={};
  // minimize the call surface to PiP — client-side, no reload
  await page.evaluate(()=>{ const b=document.querySelector('[data-testid="call-surface-minimize"]'); if(b) b.click(); });
  await page.waitForTimeout(3000);
  out.url = page.url();
  out.hub = await page.evaluate(()=>{
    const t=document.body.innerText.replace(/\s+/g,' ');
    return { live: (t.match(/Live now.{0,200}/)||[])[0]||null, sched: (t.match(/Scheduled today.{0,260}/)||[])[0]||null };
  });
  // requests made while clicking Start call on the scheduled card
  const reqs=[];
  const onReq = r => { if (r.url().includes('/api/v1/')) reqs.push(r.method()+' '+r.url().replace(/^https?:\/\/[^/]+/,'')); };
  page.on('request', onReq);
  out.startCallBtns = await page.evaluate(()=>[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0 && /^Start call$/i.test((x.innerText||'').trim())).length);
  const before = await page.evaluate(async()=>{ const r=await fetch(`/api/v1/workspace/W4QBF1XTURESO01/meetings/active`,{credentials:'include'}); const j=await r.json(); return (j.meetings||[]).map(m=>m.id); });
  // click it with a real mouse click at its centre
  const box = await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0 && /^Start call$/i.test((x.innerText||'').trim()))[0]; if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return {x:r.left+r.width/2, y:r.top+r.height/2}; });
  out.box = box;
  if (box) await page.mouse.click(box.x, box.y);
  await page.waitForTimeout(6000);
  page.off('request', onReq);
  out.apiReqs = reqs;
  out.after = await page.evaluate(async()=>{
    const r=await fetch(`/api/v1/workspace/W4QBF1XTURESO01/meetings/active`,{credentials:'include'}); const j=await r.json();
    const t=document.body.innerText.replace(/\s+/g,' ');
    return { url: location.href, active:(j.meetings||[]).map(m=>({id:m.id,name:m.name})),
             live:(t.match(/Live now.{0,200}/)||[])[0]||null, sched:(t.match(/Scheduled today.{0,260}/)||[])[0]||null };
  });
  out.activeBefore = before;
  return out;
};
