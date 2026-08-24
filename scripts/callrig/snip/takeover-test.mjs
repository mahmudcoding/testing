export default async ({page}) => {
  const CALL_A = process.env.CALL_A;
  const net=[]; const toasts=[];
  page.on('response', async r=>{const u=r.url(); if(u.endsWith('/api/v1/meeting')&&r.request().method()==='POST'){let b='';try{b=(await r.text()).slice(0,160);}catch(e){} net.push(`${r.status()} ${b}`);}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  // poll toasts across the whole flow
  let stop=false;
  const poll=(async()=>{ for(let i=0;i<70&&!stop;i++){
    const t=await page.evaluate(()=>{const m=document.body.innerText.match(/Leave your current[^\n]*/); return m?m[0]:null;});
    if(t && !toasts.includes(t)) toasts.push(t);
    await page.waitForTimeout(200);} })();
  await page.click('[data-testid="calls-hub-start-now"]');
  await page.waitForTimeout(1000);
  await page.fill('#calls-hub-call-name','CALL B');
  await page.click('[data-testid="calls-start-submit"]');
  await page.waitForTimeout(9000);
  stop=true; await poll;
  const B = await page.evaluate(async()=>{
    const c=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json();
    return {overlay: !!document.querySelector('[data-testid="call-overlay-expanded"]'),
            current: c&&c.meeting? {id:c.meeting.id, name:c.meeting.name} : null};
  });
  const callA = await page.evaluate(async(id)=>{
    const r=await fetch(`/api/v1/meeting/${id}`,{credentials:'include'});
    const j=await r.json();
    return {status:r.status, meetingStatus: j.meeting? j.meeting.status : null};
  }, CALL_A);
  return {sessionB_meetingCreated: net, sessionB_now: B, warningToast: toasts, callA_afterwards: callA};
};
