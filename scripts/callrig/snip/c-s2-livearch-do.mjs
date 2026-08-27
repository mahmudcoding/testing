export default async ({page}) => page.evaluate(async ()=>{
  const r=await fetch('/api/v1/channels/C4OXICXIKND2B2J/archive',{method:'POST',credentials:'include'});
  return {status:r.status};
});
