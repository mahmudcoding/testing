export default async ({page}) => {
  const inCall = await page.evaluate(async()=>{const c=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json(); return !!(c&&c.meeting);});
  if (!inCall) return {err:'not in a call'};
  const mini = await page.$('[data-testid="call-surface-minimize"]');
  if (mini) { await mini.click().catch(()=>{}); await page.waitForTimeout(2500); }
  const start = await page.$('[data-testid="calls-hub-start-now"]');
  if (!start) return {err:'no Start now'};
  await start.click(); await page.waitForTimeout(1200);
  await page.fill('#calls-hub-call-name','SECOND CALL 2');

  const hits=[]; let stop=false;
  const poll=(async()=>{ for(let i=0;i<75&&!stop;i++){
    const r = await page.evaluate(()=>{
      const txt = document.body.innerText;
      const m = txt.match(/Leave your current[^\n]*/);
      return {found: m? m[0] : null};
    });
    if (r.found && !hits.some(h=>h.text===r.found)) hits.push({t:i*200+'ms', text:r.found});
    await page.waitForTimeout(200);} })();
  await page.click('[data-testid="calls-start-submit"]');
  await page.waitForTimeout(15000);
  stop=true; await poll;

  const bodyNow = await page.evaluate(()=>document.body.innerText.replace(/\n+/g,' | ').slice(0,300));
  return {inCall, leaveWarningSeen: hits, bodySample: bodyNow};
};
