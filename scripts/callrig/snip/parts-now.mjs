export default async ({page}) => await page.evaluate(async (M) => {
  const j = await (await fetch('/api/v1/meeting/'+M+'/participants',{credentials:'include'})).json();
  return (j.participants||[]).map(p=>p.name+' @'+p.joined_at);
}, process.env.QA_MEET);
