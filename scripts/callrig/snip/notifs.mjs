export default async ({page}) => await page.evaluate(async()=>{
  const r = await fetch('/api/v1/notifications?limit=30',{credentials:'include'});
  const j = await r.json();
  const n = j.notifications||[];
  return {total: j.total, unread: j.unread_count,
          types: [...new Set(n.map(x=>x.type||x.kind||'?'))].slice(0,10),
          callish: n.filter(x=>/call|meeting/i.test(JSON.stringify(x))).slice(0,3).map(x=>JSON.stringify(x).slice(0,220))};
});
