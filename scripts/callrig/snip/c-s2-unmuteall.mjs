export default async ({page}) => {
  const out={};
  out.api=await page.evaluate(async()=>{
    const r=await fetch('/api/v1/notifications/channels/C4QCGENERAL0001/mute',{method:'DELETE',credentials:'include'});
    return {status:r.status, body:(await r.text()).slice(0,40)};});
  await page.evaluate(()=>{ try{
    localStorage.setItem('aloqa.channel.mute', JSON.stringify({state:{mutedByChannel:{}},version:1}));
  }catch(e){} });
  await page.reload(); await page.waitForTimeout(6000);
  out.ls=await page.evaluate(()=>String(localStorage.getItem('aloqa.channel.mute')).slice(0,80));
  return out;
};
