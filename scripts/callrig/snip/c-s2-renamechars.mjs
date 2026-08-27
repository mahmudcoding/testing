export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(9000);
  return page.evaluate(async(ws)=>{
    const mk=async(name)=>{
      const r=await fetch('/api/v1/channels',{method:'POST',credentials:'include',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({name, workspace_id:ws, type:'public', description:'throwaway: rename chars'})});
      const t=await r.text(); let j={}; try{j=JSON.parse(t);}catch(e){}
      return {status:r.status, id:j.id||j.channel_id, storedName:j.name, raw:r.ok?undefined:t.slice(0,110)};};
    const ren=async(id,name)=>{
      const r=await fetch(`/api/v1/channels/${id}`,{method:'PATCH',credentials:'include',
        headers:{'content-type':'application/json'}, body:JSON.stringify({name, description:'throwaway'})});
      const t=await r.text(); let j={}; try{j=JSON.parse(t);}catch(e){}
      return {status:r.status, storedName:j.name, raw:r.ok?undefined:t.slice(0,110)};};
    const created=await mk('qa-c2-renametest');
    if(!created.id) return {created};
    const cases=['team/alpha?beta','ИМЯ С Пробелами','name with  spaces','  padded  ','emoji-🚀-name','UPPER/lower?Q'];
    const results=[];
    for(const c of cases) results.push({input:c, ...await ren(created.id,c)});
    // put it back and archive
    await ren(created.id,'qa-c2-renametest');
    const a=await fetch(`/api/v1/channels/${created.id}/archive`,{method:'POST',credentials:'include'});
    return {createdAs:created.storedName, results, archived:a.status};}, ws);
};
