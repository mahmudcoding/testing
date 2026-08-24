export default async ({page}) => {
  const M = process.env.QA_MEET;
  const res = await page.evaluate(async (M) => {
    const w = await (await fetch('/api/v1/meeting/'+M+'/waiting',{credentials:'include'})).json();
    const out = [];
    for (const p of (w.participants||[])) {
      const r = await fetch('/api/v1/meeting/'+M+'/participants/'+p.participant_id+'/admit',{method:'POST',credentials:'include'});
      out.push(p.name+' -> '+r.status);
    }
    return out;
  }, M);
  await page.waitForTimeout(6000);
  const parts = await page.evaluate(async (M) => ((await (await fetch('/api/v1/meeting/'+M+'/participants',{credentials:'include'})).json()).participants||[]).map(p=>p.name), M);
  return {admitted: res, participants: parts};
};
