export default async ({page}) => await page.evaluate(async (M)=>{
  const p=await (await fetch('/api/v1/meeting/'+M+'/participants',{credentials:'include'})).json().catch(()=>({}));
  return {names:(p.participants||[]).map(x=>x.name).sort()};
}, process.env.QA_MEET);
