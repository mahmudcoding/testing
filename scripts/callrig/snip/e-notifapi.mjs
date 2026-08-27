export default async ({page}) => {
  return await page.evaluate(async()=>{
    const r=await fetch('/api/v1/notifications?limit=5',{credentials:'include'});
    const j=await r.json();
    const arr=j.notifications||j.data||[];
    return {keys:arr[0]?Object.keys(arr[0]).join(','):null,
      items:arr.slice(0,2).map(n=>({title:n.title, body:n.body, actor:n.actor_name||n.actor||n.sender_name||n.username,
        raw:JSON.stringify(n).slice(0,420)}))};
  });
};
