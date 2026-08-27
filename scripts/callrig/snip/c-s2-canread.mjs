export default async ({page}) => {
  const ch='C4OX0TTLIMVOUBH';
  return await page.evaluate(async (ch)=>{
    const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json().catch(()=>null);
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=3`,{credentials:'include'});
    const t=(await r.text()).slice(0,120);
    return {who:me?.email||me?.user?.email||'?', status:r.status, body:t};
  }, ch);
};
