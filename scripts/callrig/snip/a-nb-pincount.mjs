export default async ({page}) => await page.evaluate(()=>{
  const l = window.__wsLog||[];
  const j = l.filter(x=>x.d && x.d[0]==='{');
  return {hooked:!!window.__wsHooked, total:l.length,
    pins: j.filter(x=>/pinned_at/.test(x.d)).length,
    unpins: j.filter(x=>/room.video.unpinned/.test(x.d)).length,
    subs: j.filter(x=>/"type":"(un)?subscribe(d)?"/.test(x.d) && /meeting_id/.test(x.d))
           .map(x=>x.dir[0]+':'+(JSON.parse(x.d).type)),
    lastJson: j.length? j[j.length-1].d.slice(0,90):null};
});
