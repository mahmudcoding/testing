export default async ({page}) => {
  return await page.evaluate(async ()=>{
    const g = async(u)=>{const r=await fetch(u,{credentials:'include'}); return {s:r.status, b:(await r.text()).slice(0,220)};};
    return {
      byId: await g('/api/v1/messaging/messages/M4OWLYAIKTDCO26'),
      inPage: await g('/api/v1/messaging/channels/C4OWKU9EANT1XSR/messages?limit=3&before_seq=2')
    };
  });
};
