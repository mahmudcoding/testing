export default async ({page}) => {
  const out = await page.evaluate(`(async () => {
    if(window.__pollTimer){ clearInterval(window.__pollTimer); window.__pollTimer=null; }
    const r=await fetch('/api/v1/notifications?limit=3',{credentials:'include'});
    const d=await r.json();
    return (d.notifications||[]).slice(0,2).map(n=>({title:n.title, title_key:n.title_key,
      body:n.body, event:n.event_type, actor:n.actor_name, created:n.created_at})); })()`);
  return out;
};
