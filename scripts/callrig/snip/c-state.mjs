export default async ({page}) => {
  return await page.evaluate(async ()=>{
    let cur=null; try{cur=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json();}catch(e){}
    const m=document.querySelector('main')||document.body;
    return {url:location.pathname, inCall: !!(cur&&cur.meeting), meetingId: cur&&cur.meeting?cur.meeting.id:null,
      toolbar:[...document.querySelectorAll('button')].filter(b=>b.getClientRects().length).map(b=>b.getAttribute('aria-label')).filter(Boolean).slice(-22),
      tiles: [...document.querySelectorAll('[data-participant-id],[data-testid*="tile"]')].length};
  });
};
