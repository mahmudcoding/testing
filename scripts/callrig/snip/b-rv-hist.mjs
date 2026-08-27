export default async ({page}) => {
  const WS='W4QBF1XTURESO01';
  await page.goto(`https://staging.airion-cargo.store/w/${WS}/calls`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  return await page.evaluate(async()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const rows=[...document.querySelectorAll('button,[role=listitem],li')].filter(vis)
      .map(b=>(b.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>/·\s*(Ended|No answer|Declined|Canceled)/.test(t)).slice(0,8);
    const r=await fetch('/api/v1/meetings/history?limit=100',{credentials:'include'});
    const j=await r.json().catch(()=>null);
    const arr=(j&&(j.meetings||j.items||j.data))||[];
    const keys=new Set(); arr.forEach(m=>Object.keys(m).forEach(k=>keys.add(k)));
    const withEnd=arr.filter(m=>'end_reason' in m).length;
    const withMissed=arr.filter(m=>'missed_for_viewer' in m).length;
    return {rows, n:arr.length, keys:[...keys].sort(), withEndReason:withEnd, withMissedForViewer:withMissed,
      sample: arr.slice(0,3).map(m=>({name:m.name, type:m.type||m.meeting_type, dir:m.direction, end:m.end_reason, dur:m.duration_seconds||m.call_duration_seconds}))};
  });
};
