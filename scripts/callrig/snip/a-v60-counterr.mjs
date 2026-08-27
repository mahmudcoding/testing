export default async ({ page }) => {
  const tries = [
    '/api/v1/calendar/meetings?workspace_id=W4QAF1XTURESO01&from=2026-08-23T19%3A00%3A00.000Z',
    '/api/v1/calendar/meetings?workspace_id=W4QAF1XTURESO01&from=2026-08-23T19%3A00%3A00.000Z&to=2026-08-31T19%3A00%3A00.000Z',
  ];
  return await page.evaluate(async(tries)=>{
    const out=[];
    for(const u of tries){ const r=await fetch(u,{credentials:'include'}); const t=await r.text();
      out.push({u:u.slice(40,120), s:r.status, body:t.slice(0,160)}); }
    return out;
  }, tries);
};
