import { safeClick } from './lib.mjs';
export default async ({page}) => {
  const out={};
  await page.evaluate(()=>{ const b=document.querySelector('[data-testid="call-surface-minimize"]'); if(b) b.click(); });
  await page.waitForTimeout(3000);
  out.url0 = page.url();
  // find the Start call button and prove it is topmost at its own centre
  out.probe = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0 && /^Start call$/i.test((x.innerText||'').trim()))[0];
    if(!b) return {found:false};
    b.scrollIntoView({block:'center'});
    const r=b.getBoundingClientRect();
    const cx=r.left+r.width/2, cy=r.top+r.height/2;
    const top=document.elementFromPoint(cx,cy);
    // the card this button belongs to, smallest ancestor holding the meeting title
    let card=b, guard=0;
    while(card && guard++<12 && !/QA sched reverify/.test(card.innerText||'')) card=card.parentElement;
    return {found:true, cx:Math.round(cx), cy:Math.round(cy),
            topmostIsButton: top===b || b.contains(top),
            topTag: top&&top.tagName, topText:(top&&top.innerText||'').replace(/\s+/g,' ').slice(0,60),
            cardText: (card&&card.innerText||'').replace(/\s+/g,' ').slice(0,160)};
  });
  if (!out.probe.found || !out.probe.topmostIsButton) return out;
  const reqs=[];
  const onReq = r => { if (r.url().includes('/api/v1/')) reqs.push(r.method()+' '+r.url().replace(/^https?:\/\/[^/]+/,'')); };
  page.on('request', onReq);
  await page.mouse.click(out.probe.cx, out.probe.cy);
  await page.waitForTimeout(6000);
  page.off('request', onReq);
  out.apiReqs = reqs;
  out.nonGet = reqs.filter(r=>!r.startsWith('GET '));
  out.after = await page.evaluate(async()=>{
    const r=await fetch(`/api/v1/workspace/W4QBF1XTURESO01/meetings/active`,{credentials:'include'}); const j=await r.json();
    const t=document.body.innerText.replace(/\s+/g,' ');
    return { url: location.href, active:(j.meetings||[]).map(m=>({id:m.id,name:m.name})),
             live:(t.match(/Live now.{0,140}/)||[])[0]||null, sched:(t.match(/Scheduled today.{0,140}/)||[])[0]||null };
  });
  return out;
};
