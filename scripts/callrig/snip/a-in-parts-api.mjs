export default async ({page}) => {
  const M = process.env.QA_MEET;
  const api = await page.evaluate(async (M)=>{
    const r = await fetch('/api/v1/meeting/'+M+'/participants',{credentials:'include'});
    const j = await r.json();
    return {status:r.status, parts:(j.participants||[]).map(p=>({name:p.name, room:p.breakout_room_id||p.room_id||p.side_room_id||null, st:p.status||null}))};
  }, M);
  const panel = await page.evaluate(()=>{
    const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const p=[...r.querySelectorAll('[data-testid="call-side-panel-slot"]')][0];
    return p?(p.innerText||'').replace(/\n+/g,' | ').slice(0,300):null;
  });
  const tiles = await page.evaluate(()=>{
    const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    return [...r.querySelectorAll('[data-testid="participant-tile-card-trigger"]')].map(b=>b.getAttribute('aria-label'));
  });
  return {api, panel, tiles};
};
