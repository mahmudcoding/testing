export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/notifications`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2200);
  return await page.evaluate(async () => {
    const get=async()=>{const r=await fetch('/api/v1/notifications/settings',{credentials:'include'});
      return await r.json();};
    const patch=async b=>{const r=await fetch('/api/v1/notifications/settings',
      {method:'PATCH',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});
      const t=await r.text(); let j=null; try{j=JSON.parse(t)}catch{}; return {s:r.status,j,t:t.slice(0,180)};};
    const DEFAULT={in_app_enabled:true,mute_all_channels:false,mute_unknown_dm_users:false,do_not_disturb_enabled:false};
    const original=await get();
    const results=[];
    const keys=['in_app_enabled','mute_all_channels','mute_unknown_dm_users','do_not_disturb_enabled'];
    for (let mask=0; mask<16; mask++){
      const body={}; keys.forEach((k,i)=>body[k]=Boolean(mask&(1<<i)));
      // always start from a known-good state so each attempt is independent
      await patch(DEFAULT);
      const r=await patch(body);
      results.push({ combo:keys.map((k,i)=>(mask&(1<<i))?1:0).join(''), status:r.s,
                     key: r.j && r.j.key ? r.j.key : null,
                     message: r.j && r.j.message ? String(r.j.message).slice(0,90) : null });
    }
    await patch(DEFAULT);
    const restored=await get();
    return { original, restored, legend:keys, results };
  });
};
