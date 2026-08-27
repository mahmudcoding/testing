export default async ({page}) => {
  const out={};
  out.submitted = await page.evaluate(()=>{ const b=document.querySelector('[data-testid="side-room-create-submit"]'); if(b){b.click(); return true;} return false; });
  await page.waitForTimeout(6000);
  out.after = await page.evaluate(async()=>{
    const t=document.body.innerText.replace(/\s+/g,' ');
    const mid=(location.pathname.match(/\/call\/([A-Za-z0-9]+)/)||[])[1];
    const r=await fetch(`/api/v1/meeting/${mid}/breakout-rooms`,{credentials:'include'});
    const j=await r.json().catch(()=>null);
    return {sideRooms:(t.match(/Side Rooms.{0,200}/)||[])[0]||null, api:{s:r.status, body:JSON.stringify(j).slice(0,600)}};
  });
  return out;
};
