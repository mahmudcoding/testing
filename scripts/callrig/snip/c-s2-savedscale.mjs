export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(8000);
  out.before=await page.evaluate(async()=>{
    const r=await fetch('/api/v1/users/me/saved-messages?limit=100',{credentials:'include'});
    const t=await r.text(); let j={}; try{j=JSON.parse(t);}catch(e){}
    return {status:r.status, keys:Object.keys(j).slice(0,5),
      n:(j.messages||j.items||j.saved_messages||[]).length, raw:r.ok?undefined:t.slice(0,120)};});
  // save 60 of the QA-DEEP messages
  out.saved=await page.evaluate(async(ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=100`,{credentials:'include'});
    const j=await r.json(); const arr=(j.messages||[]).slice(0,60);
    let ok=0, err=null;
    for(const m of arr){
      const s=await fetch('/api/v1/users/me/saved-messages',{method:'POST',credentials:'include',
        headers:{'content-type':'application/json'}, body:JSON.stringify({message_id:m.id})});
      if(s.ok) ok++; else if(!err) err={status:s.status, body:(await s.text()).slice(0,110)};
    }
    return {tried:arr.length, ok, firstErr:err};}, ch);
  out.after=await page.evaluate(async()=>{
    const r=await fetch('/api/v1/users/me/saved-messages?limit=100',{credentials:'include'});
    const j=await r.json().catch(()=>({}));
    const arr=j.messages||j.items||j.saved_messages||[];
    return {n:arr.length, keys:Object.keys(j).slice(0,5)};});
  // open the Saved page and count what is reachable
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/saved`);
  await page.waitForTimeout(11000);
  const count=()=>page.evaluate(()=>{
    const els=[...document.querySelectorAll('main [data-message-id]')];
    const main=document.querySelector('main');
    return {rendered:els.length,
      head:(main.innerText||'').replace(/\s+/g,' ').slice(0,70)};});
  out.pageOnOpen=await count();
  const box=await page.locator('main').boundingBox();
  await page.mouse.move(Math.round(box.x+box.width/2), Math.round(box.y+box.height/2));
  let stalls=0; const series=[out.pageOnOpen];
  for(let i=0;i<40 && stalls<8;i++){
    await page.mouse.wheel(0,-1200); await page.waitForTimeout(400);
    const s=await count();
    if(s.rendered===series[series.length-1].rendered) stalls++; else stalls=0;
    series.push(s);
  }
  out.pageAfterScroll=series[series.length-1];
  out.maxRendered=Math.max(...series.map(s=>s.rendered));
  return out;
};
