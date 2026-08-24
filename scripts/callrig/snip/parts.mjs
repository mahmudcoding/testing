export default async ({page}) => await page.evaluate(async(mid)=>{
  const j = await (await fetch(`/api/v1/meeting/${mid}/participants`,{credentials:'include'})).json();
  return (j.participants||[]).map(p=>p.name);
}, process.env.QA_MID);
