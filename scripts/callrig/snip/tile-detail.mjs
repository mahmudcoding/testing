export default async ({page}) => {
  const api = await page.evaluate(async () => {
    const j = async p => { const r=await fetch(p,{credentials:'include'}); try{return await r.json();}catch(e){return {s:r.status};} };
    const parts = await j('/api/v1/meeting/V4OTLVMJL42ZGIG/participants');
    const rooms = await j('/api/v1/meeting/V4OTLVMJL42ZGIG/breakout-rooms');
    return {participants: (parts.participants||[]).map(p=>p.name),
            rooms: (rooms.rooms||[]).map(r=>({name:r.name, n:r.participant_count, who:(r.participant_preview||[]).map(x=>x.name)}))};
  });
  const tiles = await page.evaluate(() => {
    const s = document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    return [...s.querySelectorAll('[data-testid="participant-tile-card-trigger"]')].map(b=>{
      const tile = b.closest('div[class*="group"]') || b.parentElement.parentElement;
      return {aria: b.getAttribute('aria-label'),
              tileText: (tile? tile.innerText:'').replace(/\n+/g,' | ').slice(0,120),
              marks: [...(tile||b).querySelectorAll('[aria-label],img,svg')].map(e=>e.getAttribute('aria-label')).filter(Boolean).slice(0,6)};
    });
  });
  return {api, tiles};
};
