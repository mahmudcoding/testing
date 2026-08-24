export default async ({page}) => {
  const secs = Number(process.env.QA_SECS||70);
  const toasts=[];
  await page.exposeFunction('__qaT', t => toasts.push({t, at:new Date().toISOString()})).catch(()=>{});
  await page.evaluate(() => {
    if (window.__qaWatch) return; window.__qaWatch=1;
    const seen=new Set();
    setInterval(()=>{ document.querySelectorAll('[data-sonner-toast],[role="status"],[role="alert"]').forEach(e=>{
      const t=e.innerText.replace(/\n+/g,' ').trim(); if(t && !seen.has(t)){ seen.add(t); window.__qaT && window.__qaT(t.slice(0,140)); }});},250);
  });
  await page.waitForTimeout(secs*1000);
  const notifs = await page.evaluate(async ()=>{
    const n = await (await fetch('/api/v1/notifications?limit=4',{credentials:'include'})).json();
    return (n.notifications||[]).map(x=>({title:x.title, key:x.title_key, body:x.body, et:x.event_type, cat:x.category}));
  });
  return {toasts, notifs};
};
