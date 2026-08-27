export default async ({page}) => {
  return await page.evaluate(async ()=>{
    const g = async(u)=>{const r=await fetch(u,{credentials:'include'}); return {s:r.status, b:(await r.text()).slice(0,600)};};
    const cur = await g('/api/v1/meetings/current');
    const me  = await g('/api/v1/auth/me');
    let meId=null; try{ meId=JSON.parse(me.b).id; }catch(e){}
    return {url:location.href, meId, current:cur};
  });
};
