export default async ({page}) => page.evaluate(async()=>{
  const j=await (await fetch('/api/v1/notifications?limit=10',{credentials:'include'})).json();
  return (j.notifications||j.data||j||[]).slice(0,5)
    .map(n=>({type:n.type,title:n.title,body:(n.body||'').replace(/\s+/g,' ').slice(0,46),at:n.created_at}));
});
