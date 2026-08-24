export default async ({page}) => {
  return await page.evaluate(async () => {
    const j = await (await fetch('/api/v1/meeting/V4OTMTBKMTGKA9B/events?limit=100',{credentials:'include'})).json();
    const ev = j.events||[];
    const types = {};
    ev.forEach(e=>{ types[e.event_type]=(types[e.event_type]||0)+1; });
    return {n: ev.length, types, sampleRecording: ev.filter(e=>/record/i.test(e.event_type)).slice(0,3).map(e=>({t:e.event_type, vis:e.visibility, payload: JSON.stringify(e.payload||e.data||{}).slice(0,220)}))};
  });
};
