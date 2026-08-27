export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/saved`);
  await page.waitForTimeout(9000);
  out.channel=await page.evaluate(async(ws)=>{
    const r=await fetch(`/api/v1/workspaces/${ws}/saved-messages`,{credentials:'include'});
    const t=await r.text(); let j={}; try{j=JSON.parse(t);}catch(e){}
    return {status:r.status, id:j.id||j.channel_id, keys:Object.keys(j).slice(0,6),
      raw:r.ok?undefined:t.slice(0,110)};}, ws);
  if(!out.channel.id) return out;
  out.fill=await page.evaluate(async(sc)=>{
    const before=await fetch(`/api/v1/messaging/channels/${sc}/messages?limit=100`,{credentials:'include'});
    const bj=await before.json().catch(()=>({}));
    let ok=0, err=null;
    for(let i=1;i<=60;i++){
      const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({channel_id:sc, body:`QA-S2-SAVED-${String(i).padStart(2,'0')}`,
          idempotency_key:'qas-'+Math.random().toString(36).slice(2)})});
      if(r.ok) ok++; else if(!err) err={status:r.status, body:(await r.text()).slice(0,100)};
    }
    return {had:(bj.messages||[]).length, added:ok, firstErr:err};}, out.channel.id);
  await page.goto('about:blank'); await page.waitForTimeout(700);
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/saved`);
  await page.waitForTimeout(12000);
  const count=()=>page.evaluate(()=>{
    const els=[...document.querySelectorAll('main [data-message-id]')];
    const nums=els.map(e=>{const m=(e.innerText||'').match(/QA-S2-SAVED-(\d\d)/); return m?+m[1]:null;})
      .filter(n=>n!==null);
    return {rendered:els.length, saved:nums.length,
      min:nums.length?Math.min(...nums):null, max:nums.length?Math.max(...nums):null};});
  out.onOpen=await count();
  const box=await page.locator('main').boundingBox();
  await page.mouse.move(Math.round(box.x+box.width/2), Math.round(box.y+box.height/2));
  let stalls=0; const series=[out.onOpen];
  for(let i=0;i<40 && stalls<8;i++){
    await page.mouse.wheel(0,-1200); await page.waitForTimeout(420);
    const s=await count();
    const p=series[series.length-1];
    if(s.rendered===p.rendered && s.min===p.min) stalls++; else stalls=0;
    series.push(s);
    if(s.min===1) break;
  }
  out.afterScroll=series[series.length-1];
  out.reachedFirst=series[series.length-1].min===1;
  return out;
};
