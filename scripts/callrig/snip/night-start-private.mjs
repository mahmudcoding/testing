export default async ({page}) => {
  const name=process.env.QA_NAME||'QA-PRIVATE-CALL';
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/meeting')&&r.request().method()==='POST'){let b='';try{b=(await r.text()).slice(0,320);}catch(e){} net.push(`${r.status()} :: ${b}`);}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.click('[data-testid="calls-hub-start-now"]');
  await page.waitForTimeout(2000);
  await page.fill('#calls-hub-call-name', name);
  // pick "Private" access
  const picked=await page.evaluate(()=>{
    const ms=[...document.querySelectorAll('[role="dialog"]')];
    const m=ms[ms.length-1];
    const labels=[...m.querySelectorAll('label')];
    for (const l of labels){ if(/^Private/.test(l.innerText.trim())){ const i=l.querySelector('input'); if(i){ i.click(); return l.innerText.replace(/\n+/g,' ').slice(0,50); } l.click(); return 'label:'+l.innerText.slice(0,30); } }
    return null;
  });
  await page.waitForTimeout(800);
  await page.click('[data-testid="calls-start-submit"]');
  await page.waitForTimeout(8000);
  const m=await page.evaluate(async ()=>{ const j=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json(); return j.meeting?{id:j.meeting.id,name:j.meeting.name,is_private:j.meeting.is_private}:j; });
  return {picked, meeting:m, net};
};
