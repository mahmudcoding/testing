export default async ({page}) => {
  const mid=process.env.QA_MID;
  const out={};
  out.waiting = await page.evaluate(async(id)=>{
    const r=await fetch(`/api/v1/meeting/${id}/waiting`,{credentials:'include'});
    let b=null; try{b=await r.json();}catch{}
    return {status:r.status, body:JSON.stringify(b).slice(0,300)};
  }, mid);
  await page.evaluate(()=>{ const b=document.querySelector('[data-testid="call-controls-people-toggle"]'); if(b&&b.getAttribute('aria-pressed')!=='true') b.click(); });
  await page.waitForTimeout(3000);
  out.panel = await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const t=document.body.innerText.replace(/\s+/g,' ');
    return {waitingText:(t.match(/WAITING.{0,120}/i)||[])[0]||null,
      admitDeny:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim()).filter(x=>/admit|deny/i.test(x)),
      inCall:(t.match(/\d+ in call/i)||[])[0]||null};
  });
  return out;
};
