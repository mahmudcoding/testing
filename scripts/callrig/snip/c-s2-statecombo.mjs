export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const mk=(txt)=>page.evaluate(async({ch,txt})=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:txt, idempotency_key:'qsc-'+Math.random().toString(36).slice(2)})});
    return (await r.json()).id;},{ch,txt});
  const pinnedState=()=>page.evaluate(async(ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages/pinned`,{credentials:'include'});
    const j=await r.json().catch(()=>({}));
    const v=(e)=>{const r2=e.getBoundingClientRect(); if(r2.width<3||r2.height<3) return false;
      let o=1,n=e; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden') return false; n=n.parentElement;}
      return o>0.05;};
    const m=document.querySelector('main');
    const banner=[...m.querySelectorAll('button,[role="button"]')].filter(v)
      .map(b=>(b.innerText||'').replace(/\s+/g,' ').slice(0,30)||b.getAttribute('aria-label'))
      .filter(t=>t&&/View all|Pinned message/i.test(t));
    return {apiTotal:j.total, apiCount:(j.messages||[]).length, banner};}, ch);
  // ── pin a message, then delete it
  const A=await mk('QA-V8-PINDEL target');
  await page.evaluate(async({ch,id})=>{
    await fetch(`/api/v1/messaging/channels/${ch}/messages/${id}/pin`,{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'}, body:JSON.stringify({pin:true})});},{ch,id:A});
  await page.reload(); await page.waitForTimeout(9000);
  out.afterPin=await pinnedState();
  out.deleteResp=await page.evaluate(async({ch,id})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages`,{method:'DELETE',credentials:'include',
      headers:{'content-type':'application/json'}, body:JSON.stringify({message_ids:[id]})});
    return {status:r.status, body:(await r.text()).slice(0,90)};},{ch,id:A});
  await page.waitForTimeout(4000);
  out.afterDeleteLive=await pinnedState();
  await page.reload(); await page.waitForTimeout(9000);
  out.afterDeleteReload=await pinnedState();
  // ── edit a message that has reactions
  const B=await mk('QA-V8-REACTEDIT base');
  await page.evaluate(async({ch,id})=>{
    for(const e of ['🚀','🔥']) await fetch(`/api/v1/messaging/channels/${ch}/messages/${id}/reactions`,
      {method:'POST',credentials:'include',headers:{'content-type':'application/json'},
       body:JSON.stringify({emoji:e})});},{ch,id:B});
  await page.waitForTimeout(2500);
  out.beforeEdit=await page.evaluate(async({ch,id})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=10`,{credentials:'include'});
    const m=((await r.json()).messages||[]).find(x=>x.id===id);
    return m? {body:m.body.slice(0,26), reactions:(m.reactions||[]).map(x=>x.emoji||x.key)}:'absent';},{ch,id:B});
  out.editResp=await page.evaluate(async({ch,id})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages/${id}`,{method:'PATCH',credentials:'include',
      headers:{'content-type':'application/json'}, body:JSON.stringify({body:'QA-V8-REACTEDIT edited'})});
    return {status:r.status, body:(await r.text()).slice(0,80)};},{ch,id:B});
  await page.waitForTimeout(3000);
  out.afterEdit=await page.evaluate(async({ch,id})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=10`,{credentials:'include'});
    const m=((await r.json()).messages||[]).find(x=>x.id===id);
    return m? {body:m.body.slice(0,26), edited:m.edited, reactions:(m.reactions||[]).map(x=>x.emoji||x.key)}:'absent';},{ch,id:B});
  return out;
};
