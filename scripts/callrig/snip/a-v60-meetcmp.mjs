export default async ({ page }) => {
  return await page.evaluate(async()=>{
    const who=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json().catch(()=>null);
    const r=await fetch('/api/v1/calendar/meetings/S4OV0EO12BSAOAQ',{credentials:'include'});
    const j=await r.json().catch(()=>null);
    const m=j?.meeting||j;
    const partKeys=Object.keys(m||{}).filter(k=>/part|attend|invit|guest/i.test(k));
    const detail={};
    for(const k of partKeys) detail[k]=JSON.stringify(m[k]).slice(0,300);
    return { who:who?.email??who?.data?.email, status:r.status,
             allKeys:Object.keys(m||{}), participantKeys:partKeys, participantValues:detail };
  });
};
