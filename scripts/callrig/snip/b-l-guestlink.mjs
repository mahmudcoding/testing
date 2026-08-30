import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const ID='V4P254XBZ5W3KPN';
  return await page.evaluate(async (id)=>{
    const r=await fetch(`/api/v1/meeting/${id}`,{credentials:'include'});
    const j=await r.json().catch(()=>null);
    const r2=await fetch(`/api/v1/meeting/${id}/settings`,{credentials:'include'});
    const j2=await r2.json().catch(()=>null);
    return {meeting:JSON.stringify(j).slice(0,400), settingsStatus:r2.status, settings:JSON.stringify(j2).slice(0,600)};
  }, ID);
};
