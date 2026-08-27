export default async ({page}) => {
  return await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/notifications?limit=30',{credentials:'include'});
    const j=await r.json(); const l=j.notifications||[];
    return {total:j.total, unread:j.unread_count, count:l.length,
      recent:l.slice(0,4).map(n=>({type:n.type, title:(n.title||'').slice(0,30), at:n.created_at}))};
  });
};
