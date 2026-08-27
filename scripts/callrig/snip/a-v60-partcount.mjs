const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const ui = await page.evaluate((vs)=>{const vis=eval(vs);
    const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    const t=(m.innerText||'').replace(/\s+/g,' ');
    const rows=[...t.matchAll(/(V60 [A-Za-z ]+\d+)\s+(\d+)\s+participants?\s+·\s+Hosted by ([^\n]{0,20})/g)].map(x=>({title:x[1],count:x[2],host:x[3].trim()}));
    return { rows, rawSlice:(t.match(/Scheduled today[^]{0,240}/)||[''])[0] };},VS);
  const api = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/calendar/meetings/S4OV0EO12BSAOAQ',{credentials:'include'});
    const j=await r.json().catch(()=>null);
    return { participant_count:j?.meeting?.participant_count,
             attendees:(j?.attendees||[]).map(a=>({user:a.user_id,status:a.status})) };});
  return { ui, api };
};
