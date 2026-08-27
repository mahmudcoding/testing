// Drive the host's pin endpoint repeatedly from the host's own page, to time how long
// a peer keeps receiving room.video.pinned. The UI path for this action is already proven;
// this is instrumentation for the boundary.
export default async ({page}) => {
  const N = Number(process.env.QA_N || 10);
  const GAP = Number(process.env.QA_GAP || 20000);
  const TGT = process.env.QA_TGT || 'U4QABOB00000001';
  return await page.evaluate(async ([n, gap, tgt])=>{
    const id = location.pathname.match(/\/call\/([A-Z0-9]+)/)[1];
    const log=[];
    for (let i=0;i<n;i++){
      const r = await fetch(`/api/v1/meeting/${id}/pin`, {method:'POST', credentials:'include',
        headers:{'content-type':'application/json'},
        body: JSON.stringify({target_type:'participant', target_user_id:tgt, breakout_room_id:''})});
      log.push({i, at:Date.now(), act:'pin', s:r.status});
      await new Promise(x=>setTimeout(x,gap));
      const d = await fetch(`/api/v1/meeting/${id}/pin?breakout_room_id=`, {method:'DELETE', credentials:'include'});
      log.push({i, at:Date.now(), act:'unpin', s:d.status});
      await new Promise(x=>setTimeout(x,gap));
    }
    return log; }, [N, GAP, TGT]);
};
