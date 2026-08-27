export default async ({page}) => page.evaluate(async()=>{
  const r=await fetch('/api/v1/users/me/channels/archived',{credentials:'include'});
  const t=await r.text();
  return {status:r.status, head:t.slice(0,400)};
});
