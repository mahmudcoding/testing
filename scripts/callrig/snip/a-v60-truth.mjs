const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const api = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/messaging/channels/C4QAGENERAL0001/messages?limit=100',{credentials:'include'});
    const j=await r.json().catch(()=>null); const a=j?.messages||[];
    return { n:a.length, rows:a.map(x=>({id:(x.id||'').slice(-6), body:(x.body||'').slice(0,44), type:x.type||x.kind||''})) };});
  const dom = await page.evaluate((vs)=>{const vis=eval(vs);
    return [...document.querySelectorAll('[data-message-id]')].filter(vis).map(x=>({
      id:(x.getAttribute('data-message-id')||'').slice(-6), txt:(x.innerText||'').replace(/\s+/g,' ').slice(0,60)}));},VS);
  const stores = await page.evaluate(()=>{
    const hits={};
    for(const k of Object.keys(localStorage)){ const v=localStorage.getItem(k)||'';
      if(/V60-FAIL|V60-OK|outbox|pending|queue/i.test(k+v)) hits[k]=v.slice(0,220); }
    return hits;});
  return { apiCount:api.n, apiHasFAIL:api.rows.some(r=>/44507/.test(r.body)), apiHasOK:api.rows.some(r=>/44512/.test(r.body)),
           apiBodies:api.rows.filter(r=>r.body).map(r=>r.body).slice(-8),
           domIds:dom.map(d=>d.id), domTail:dom.slice(-4), localStorageHits:Object.keys(stores), sample:Object.values(stores)[0]||null };
};
