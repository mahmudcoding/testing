export default async ({page}) => {
  return await page.evaluate(async()=>{
    const r=await fetch('/api/v1/users/me/channels/archived?workspace_id=W4QEF1XTURESO01',{credentials:'include'});
    const j=await r.json().catch(()=>null);
    return {status:r.status, names:(j&&(j.channels||j.data||[])).map?.(x=>x.name)||JSON.stringify(j).slice(0,120)};
  });
};
