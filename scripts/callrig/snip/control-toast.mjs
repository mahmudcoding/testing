export default async ({page}) => {
  // 1) create a call
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  await page.click('[data-testid="calls-hub-start-now"]');
  await page.waitForTimeout(1200);
  await page.fill('#calls-hub-call-name','CONTROL CALL');
  await page.click('[data-testid="calls-start-submit"]');
  await page.waitForTimeout(9000);
  const inCall = await page.evaluate(async()=>{const c=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json(); return !!(c&&c.meeting);});
  if (!inCall) return {err:'did not enter a call'};

  // 2) minimize, then try to start a SECOND call, polling toasts from t=0
  const mini = await page.$('[data-testid="call-surface-minimize"]');
  if (mini) { await mini.click().catch(()=>{}); await page.waitForTimeout(2500); }
  const start = await page.$('[data-testid="calls-hub-start-now"]');
  if (!start) return {err:'no Start now visible', inCall};
  await start.click(); await page.waitForTimeout(1200);
  await page.fill('#calls-hub-call-name','SECOND CALL');

  const seen=[]; let stop=false;
  const poll=(async()=>{ for(let i=0;i<60&&!stop;i++){
    const t= await page.evaluate(()=>[...document.querySelectorAll('[role="status"],[role="alert"],li[data-state]')]
      .map(e=>e.innerText.trim().replace(/\n+/g,' ')).filter(Boolean));
    for(const x of t) if(!seen.some(s=>s.text===x)) seen.push({t:i*200+'ms', text:x});
    await page.waitForTimeout(200);} })();
  await page.click('[data-testid="calls-start-submit"]');
  await page.waitForTimeout(12000);
  stop=true; await poll;
  return {inCall, toastsSeen: seen};
};
