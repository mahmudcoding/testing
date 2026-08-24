export default async ({page}) => {
  const M = process.env.QA_MEET;
  const tag='qaD'+Date.now();
  const toasts=[]; const net=[];
  await page.exposeFunction(tag, t=>toasts.push({t, at:Date.now()}));
  await page.evaluate((tag)=>{ const seen=new Set();
    window.__qaInt && clearInterval(window.__qaInt);
    window.__qaInt=setInterval(()=>{document.querySelectorAll('[data-sonner-toast],[role="status"],[role="alert"]').forEach(e=>{
      const t=e.innerText.replace(/\n+/g,' ').trim(); if(t&&!seen.has(t)){seen.add(t); window[tag]&&window[tag](t.slice(0,140));}});},150);}, tag);
  page.on('response', async r=>{const u=r.url(); if(/recording/.test(u)&&r.request().method()==='POST'){
    let b=''; try{b=(await r.text()).slice(0,160);}catch(e){}
    net.push({at:Date.now(), line:`${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`});}});

  // start a recording
  await page.click('[data-testid="recording-start-access-trigger"]');
  await page.waitForTimeout(1500);
  const db=page.locator('[role="dialog"] button',{hasText:'Start recording'}).first();
  if(await db.count()) await db.click();
  await page.waitForTimeout(18000);

  const tStop=Date.now();
  await page.locator('[data-testid="call-toolbar"] button[aria-label="Stop recording"]').first().click();
  await page.waitForTimeout(4000);
  const midState = await page.evaluate(()=>{const tb=document.querySelector('[data-testid="call-toolbar"]');
    const b=tb?[...tb.querySelectorAll('button')].find(x=>/record/i.test(x.getAttribute('aria-label')||'')):null;
    return b? {aria:b.getAttribute('aria-label'), col:getComputedStyle(b).color} : {none:true};});
  // second click while it still says Stop recording
  const tSecond=Date.now();
  const b2=page.locator('[data-testid="call-toolbar"] button[aria-label="Stop recording"]').first();
  const clickedAgain = await b2.count() ? (await b2.click(), true) : false;
  await page.waitForTimeout(10000);
  const after = await page.evaluate(async (M)=>{
    const j=await (await fetch('/api/v1/meeting/'+M+'/recordings',{credentials:'include'})).json();
    const tb=document.querySelector('[data-testid="call-toolbar"]');
    const b=tb ? [...tb.querySelectorAll('button')].find(x=>/record/i.test(x.getAttribute('aria-label')||'')) : null;
    return {recordings:(j.recordings||[]).map(r=>({id:r.id,st:r.status,dur:r.duration_sec,started:r.started_at})),
            aria: b? b.getAttribute('aria-label') : '(no record button)',
            allButtons: tb ? [...tb.querySelectorAll('button')].map(x=>x.getAttribute('aria-label')).filter(Boolean).slice(0,18) : null,
            badge: !!document.querySelector('[data-testid="call-recording-badge"]')};}, M);
  return {stateAt4sAfterStop: midState, clickedAgain,
          secondClickAtSec: Math.round((tSecond-tStop)/1000),
          net: net.map(x=>({sec:Math.round((x.at-tStop)/1000), line:x.line})),
          toasts: toasts.map(x=>({sec:Math.round((x.at-tStop)/1000), t:x.t})),
          after};
};
