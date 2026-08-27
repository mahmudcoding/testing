export default async ({page}) => {
  const ms=Number(process.env.QA_MS||60000);
  return await page.evaluate(async (ms)=>{
    const out=[]; const t0=Date.now(); let last=null;
    while(Date.now()-t0<ms){
      const tiles=[...document.querySelectorAll('[data-testid="participant-tile"]')].map(t=>{
        const n=t.querySelector('[data-testid="participant-name"]');
        return (n?n.innerText.trim():'?')+(t.querySelector('[data-testid="participant-tile-side-room-dot"]')?'[SIDE]':'');
      }).sort().join(', ');
      const rooms=await (await fetch('/api/v1/meeting/V4OU5I7E3MDGOPX/breakout-rooms',{credentials:'include'})).json();
      const inRoom=((rooms.rooms||[])[0]||{}).participant_preview||[];
      const cur=tiles+'  ||  server-in-room: '+inRoom.map(p=>p.name).join(',');
      if(cur!==last){ out.push({at:Math.round((Date.now()-t0)/1000)+'s', s:cur}); last=cur; }
      await new Promise(r=>setTimeout(r,3000));
    }
    return {timeline: out};
  }, ms);
};
