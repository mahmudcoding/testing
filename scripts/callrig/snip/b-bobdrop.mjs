export default async ({page, ctx}) => {
  const out={};
  out.before = await page.evaluate(async()=>{ const j=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json().catch(()=>null); return j&&j.meeting?{id:j.meeting.id, n:(j.meeting.participants||[]).length}:null; });
  // simulate the tab being closed / navigated away without pressing Leave
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  out.after = await page.evaluate(async()=>{ const j=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json().catch(()=>null); return {cur: j&&j.meeting?j.meeting.id:null, url:location.href}; });
  return out;
};
