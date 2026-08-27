export default async ({page}) => {
  const id = process.env.QA_MEET;
  const m = await page.evaluate(async (id) => {
    const r = await fetch('/api/v1/meeting/'+id, {credentials:'include'});
    const j = await r.json(); const mm = j.meeting||j;
    return {status: mm.status, st: mm.started_at, en: mm.ended_at, keys: Object.keys(mm).filter(k=>/reason|end/i.test(k)).map(k=>k+'='+mm[k])};
  }, id);
  const ui = await page.evaluate(()=>document.body.innerText.replace(/\n+/g,' | ').slice(-320));
  return {meeting: m, ui, now: new Date().toISOString()};
};
