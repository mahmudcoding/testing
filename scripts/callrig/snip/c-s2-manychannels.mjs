export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const n=parseInt(process.env.QA_N||'10',10);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(8000);
  return page.evaluate(async({ws,n})=>{
    const made=[];
    for(let i=1;i<=n;i++){
      const name='qa-c2-bulk-'+String(i).padStart(2,'0');
      const r=await fetch('/api/v1/channels',{method:'POST',credentials:'include',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({name, workspace_id:ws, type:'public',
          description:'throwaway: sidebar ordering at scale'})});
      if(!r.ok){ made.push({name, err:r.status}); continue; }
      const j=await r.json(); const id=j.id||j.channel_id;
      // put one message in each so they are not empty
      await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({channel_id:id, body:'QA-BULK seed '+i,
          idempotency_key:'qbulk-'+Math.random().toString(36).slice(2)})});
      made.push({name, id});
    }
    return made;},{ws,n});
};
