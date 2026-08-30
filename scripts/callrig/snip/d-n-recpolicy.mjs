export default async ({page}) => {
  const id=process.env.QA_MID;
  const out={};
  // read state
  const q = async ()=> await page.evaluate(()=>{
    const vis = el=>{if(!el)return false;const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    const a=document.querySelector('[data-testid="recording-start-access-trigger"]');
    const b=document.querySelector('[data-testid="call-controls-record"]');
    return {startTrigger: a?{vis:vis(a),dis:a.disabled,l:a.getAttribute('aria-label')}:null,
            recordBtn: b?{vis:vis(b),dis:b.disabled,l:b.getAttribute('aria-label')}:null,
            recText:[...new Set([...document.querySelectorAll('*')].filter(e=>e.children.length===0&&e.innerText&&/record/i.test(e.innerText)&&vis(e)).map(e=>e.innerText.replace(/\s+/g,' ').trim().slice(0,70)))]};
  });
  out.before = await q();
  // flip recording_enabled via the API (no UI control for it in the panel)
  out.patch = await page.evaluate(async(id)=>{
    const r=await fetch(`/api/v1/meeting/${id}/settings`,{method:'PATCH',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({recording_enabled:false})});
    return {s:r.status, b:(await r.text()).slice(0,260)};}, id);
  await page.waitForTimeout(6000);
  out.after = await q();
  // try to start a recording anyway, over the API
  out.serverStart = await page.evaluate(async(id)=>{
    const r=await fetch(`/api/v1/meeting/${id}/recording/start`,{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({access:'everyone'})});
    return {s:r.status, b:(await r.text()).slice(0,240)};}, id);
  return out;
};
