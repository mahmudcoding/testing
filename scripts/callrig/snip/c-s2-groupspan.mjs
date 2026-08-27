export default async ({page}) => {
  const ch='C4QCGENERAL0001';
  const dom=await page.evaluate(()=>[...document.querySelectorAll('main [data-message-id]')]
    .map(e=>({id:e.getAttribute('data-message-id'),
      hasTime: !!(e.querySelector('time')&&e.querySelector('time').getBoundingClientRect().width>4),
      t: e.querySelector('time')? e.querySelector('time').textContent.trim():null})));
  const api=await page.evaluate(async(ch)=>{
    const j=await (await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=100`,{credentials:'include'})).json();
    const ms=j.messages||j.data||j||[];
    return Object.fromEntries(ms.map(m=>[m.id,{at:m.created_at, u:m.user_id}]));
  }, ch);
  // walk the DOM order, split into groups at each visible <time>
  const groups=[]; let cur=null;
  for (const d of dom){
    if (d.hasTime || !cur){ if(cur) groups.push(cur); cur={head:d.id, headTime:d.t, ids:[d.id]}; }
    else cur.ids.push(d.id);
  }
  if(cur) groups.push(cur);
  return groups.map(g=>{
    const stamps=g.ids.map(id=>api[id]&&api[id].at).filter(Boolean);
    const first=stamps[0], last=stamps[stamps.length-1];
    const span = (first&&last)? Math.round((new Date(last)-new Date(first))/1000):null;
    return {headTime:g.headTime, n:g.ids.length, first, last, spanSeconds:span,
      users:[...new Set(g.ids.map(id=>api[id]&&api[id].u).filter(Boolean))].length};
  });
};
