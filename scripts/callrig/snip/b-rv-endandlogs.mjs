export default async ({page}) => {
  const out={};
  const WS='W4QBF1XTURESO01';
  const mid = (page.url().match(/\/call\/([A-Za-z0-9]+)/)||[])[1] || process.env.QA_MID;
  out.mid = mid;
  out.end = await page.evaluate(async(id)=>{ const r=await fetch(`/api/v1/meeting/${id}/end`,{method:'POST',credentials:'include'}); return r.status; }, mid);
  await page.waitForTimeout(4000);
  await page.goto(`https://staging.airion-cargo.store/w/${WS}/calls/${mid}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  out.tabs = await page.evaluate(()=>[...document.querySelectorAll('button,[role=tab],a')].filter(b=>b.getBoundingClientRect().width>0).map(b=>(b.innerText||'').trim()).filter(t=>/^(Recording|Chat|Logs|Details|Overview)/.test(t)));
  out.clickedLogs = await page.evaluate(()=>{ const b=[...document.querySelectorAll('button,[role=tab],a')].filter(x=>x.getBoundingClientRect().width>0).find(x=>/^Logs/.test((x.innerText||'').trim())); if(b){b.click(); return true;} return false; });
  await page.waitForTimeout(4500);
  out.logRows = await page.evaluate(()=>{
    const m=document.querySelector('main')||document.body;
    return m.innerText.replace(/\n{2,}/g,'\n').split('\n').map(s=>s.trim()).filter(Boolean).slice(0,60);
  });
  out.events = await page.evaluate(async(id)=>{
    const r=await fetch(`/api/v1/meeting/${id}/events?limit=100`,{credentials:'include'});
    const j=await r.json().catch(()=>null);
    const arr=(j&&(j.events||j.items||j.data))||[];
    const counts={}; arr.forEach(e=>{counts[e.event_type]=(counts[e.event_type]||0)+1;});
    return {s:r.status, n:arr.length, counts};
  }, mid);
  return out;
};
