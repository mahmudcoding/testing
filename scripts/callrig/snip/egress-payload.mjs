export default async ({page}) => {
  return await page.evaluate(async () => {
    const j = await (await fetch('/api/v1/meeting/V4OTMTBKMTGKA9B/events?limit=100',{credentials:'include'})).json();
    const e = (j.events||[]).find(x=>x.event_type==='recording.egress_ended');
    return {raw: JSON.stringify(e).slice(0,2500)};
  });
};
