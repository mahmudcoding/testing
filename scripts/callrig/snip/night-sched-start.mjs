export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{ if(r.request().method()!=='GET' && (r.url().includes('calendar')||r.url().includes('meeting'))){ let b=''; try{b=(await r.text()).slice(0,320);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${r.url().replace('https://airion-cargo.store','')} :: ${b}`);} });
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const sched=await page.evaluate(()=>{
    const m=document.querySelector('main');
    const i=(m.innerText||'').indexOf('Scheduled today');
    return (m.innerText||'').slice(i, i+300).replace(/\n+/g,' | ');
  });
  const btns=await page.$$('main button');
  let clicked=null;
  for (const b of btns){ const t=(await b.innerText()).trim(); if(/^Start( meeting)?$/i.test(t)||/^Start now$/i.test(t)===false && /^Start/.test(t) && !/Start now/.test(t)){ await b.click(); clicked=t.slice(0,30); break; } }
  await page.waitForTimeout(6000);
  const st=await page.evaluate(async ()=>{
    const cur=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json().catch(()=>({}));
    return {current: cur.meeting? {id:cur.meeting.id,name:cur.meeting.name,is_private:cur.meeting.is_private,requires_approval:cur.meeting.requires_approval}:null,
      url: location.href, main:(document.querySelector('main')||{innerText:''}).innerText.replace(/\n+/g,' | ').slice(0,160)};
  });
  return {scheduledSection: sched, clicked, net, state: st};
};
