export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(9000);
  // what the API returns for archived channels
  out.api=await page.evaluate(async(ws)=>{
    const r=await fetch(`/api/v1/users/me/channels/archived?workspace_id=${ws}`,{credentials:'include'});
    const j=await r.json().catch(()=>({}));
    const arr=Array.isArray(j)?j:(j.channels||j.items||[]);
    return {status:r.status, count:arr.length,
      sample:arr.slice(0,3).map(c=>({name:c.name,
        keys:Object.keys(c).filter(k=>/activity|archiv|last|message/i.test(k)),
        last_activity_at:c.last_activity_at, archived_at:c.archived_at}))};}, ws);
  // and what the dialog shows
  const open=page.locator('button[aria-label="Open archived channels"]').first();
  out.dialogButton=await open.count();
  if(out.dialogButton){
    await open.click(); await page.waitForTimeout(3000);
    out.dialog=await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      const d=[...document.querySelectorAll('[role="dialog"],aside')].filter(v)
        .filter(x=>/Archived/i.test(x.innerText||''))
        .sort((a,b)=>b.getBoundingClientRect().height-a.getBoundingClientRect().height)[0];
      if(!d) return 'no dialog';
      return {text:(d.innerText||'').replace(/\s+/g,' ').slice(0,240),
        noActivityCount:((d.innerText||'').match(/No activity yet/g)||[]).length};});
    await page.keyboard.press('Escape');
  }
  // do those archived channels actually have messages?
  out.messageCounts=await page.evaluate(async(ws)=>{
    const r=await fetch(`/api/v1/users/me/channels/archived?workspace_id=${ws}`,{credentials:'include'});
    const j=await r.json().catch(()=>({}));
    const arr=Array.isArray(j)?j:(j.channels||j.items||[]);
    const out=[];
    for(const c of arr.slice(0,4)){
      const m=await fetch(`/api/v1/messaging/channels/${c.id}/messages?limit=5`,{credentials:'include'});
      const mj=await m.json().catch(()=>({}));
      out.push({name:c.name, status:m.status, messages:(mj.messages||[]).length});
    }
    return out;}, ws);
  return out;
};
