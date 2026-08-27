export default async ({page}) => {
  return await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/notifications?limit=25',{credentials:'include'});
    let j=null; try{j=await r.json();}catch(e){}
    const list=(j&&(j.notifications||j.data||j.items))||[];
    return {status:r.status, keys:j?Object.keys(j).join(','):null, count:list.length,
      recent:list.slice(0,12).map(n=>({type:n.type||n.kind, title:(n.title||'').slice(0,40),
        body:(n.body||n.message||'').slice(0,70), at:n.created_at}))};
  });
};
