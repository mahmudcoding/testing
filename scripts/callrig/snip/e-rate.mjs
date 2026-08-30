import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const mid=process.env.QA_MID; const stars=process.env.QA_STARS||'4';
  const out={};
  await page.evaluate(DOM);
  out.before = await page.evaluate(async (m)=>{
    const r=await fetch(`/api/v1/meeting/${m}`,{credentials:'include'});
    const j=await r.json().catch(()=>({}));
    return j.meeting?j.meeting.rating:null;
  }, mid);
  const reqs=[];
  page.on('request', r=>{ if(/\/api\/v1\/.*rating/i.test(r.url())) reqs.push(r.method()+' '+r.url().replace(/^https?:\/\/[^/]+/,'')+' '+(r.postData()||'')); });
  out.click = await page.evaluate((s)=>window.__qa.clickDeepest(new RegExp('^'+s+' stars$')), stars);
  await page.waitForTimeout(3500);
  await page.evaluate(DOM);
  out.reqs=reqs;
  out.after = await page.evaluate(()=>{
    const q=window.__qa;
    const ov=document.querySelector('[data-testid="call-ended-overlay"]');
    return {ovText: ov?(ov.innerText||'').replace(/\s+/g,' ').slice(-600):null,
      btns: ov?[...ov.querySelectorAll('button')].filter(q.vis).map(n=>({n:q.nameOf(n).slice(0,40),press:n.getAttribute('aria-pressed'),dis:n.disabled===true})):[],
      notices:q.notices()};
  });
  out.rating = await page.evaluate(async (m)=>{
    const r=await fetch(`/api/v1/meeting/${m}`,{credentials:'include'});
    const j=await r.json().catch(()=>({}));
    return j.meeting?j.meeting.rating:null;
  }, mid);
  return out;
};
