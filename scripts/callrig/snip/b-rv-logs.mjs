export default async ({page}) => {
  const WS='W4QBF1XTURESO01'; const mid=process.env.QA_MID;
  const out={mid};
  await page.goto(`https://staging.airion-cargo.store/w/${WS}/calls/${mid}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  out.status = await page.evaluate(async(id)=>{ const r=await fetch(`/api/v1/meeting/${id}`,{credentials:'include'}); const j=await r.json().catch(()=>null); const m=j&&(j.meeting||j); return {s:r.status, status:m&&m.status, ended:m&&m.ended_at}; }, mid);
  out.clickedLogs = await page.evaluate(()=>{ const b=[...document.querySelectorAll('button,[role=tab],a')].filter(x=>x.getBoundingClientRect().width>0).find(x=>/^Logs/.test((x.innerText||'').trim())); if(b){b.click(); return true;} return false; });
  await page.waitForTimeout(4500);
  out.rows = await page.evaluate(()=>{
    const m=document.querySelector('main')||document.body;
    const lines=m.innerText.replace(/\n{2,}/g,'\n').split('\n').map(s=>s.trim()).filter(Boolean);
    const i=lines.findIndex(l=>/^\d{2}:\d{2}:\d{2}/.test(l));
    return i>=0? lines.slice(i, i+40) : lines.slice(-40);
  });
  out.events = await page.evaluate(async(id)=>{
    const r=await fetch(`/api/v1/meeting/${id}/events?limit=100`,{credentials:'include'});
    const j=await r.json().catch(()=>null); const arr=(j&&(j.events||j.items||j.data))||[];
    return arr.filter(e=>/meeting\.(ended|started)/.test(e.event_type)).map(e=>({t:e.event_type, src:e.source, actor:e.actor_user_id, vis:e.visibility, payload:e.payload}));
  }, mid);
  return out;
};
