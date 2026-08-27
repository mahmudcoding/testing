export default async ({page}) => {
  const out={};
  const pad=n=>String(n).padStart(2,'0');
  const d0=new Date(Date.now()+2*60000);
  await page.goto('https://staging.airion-cargo.store/w/W4QBF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0).find(x=>(x.innerText||'').trim()==='Schedule meeting'); if(b) b.click(); });
  await page.waitForTimeout(3000);
  await page.fill('[role=dialog] input[aria-label="Add title"]','QA dbg sched');
  out.timeBefore = await page.inputValue('[role=dialog] input[aria-label="Starts time"]');
  await page.fill('[role=dialog] input[aria-label="Starts time"]', `${pad(d0.getHours())}:${pad(d0.getMinutes())}`);
  await page.waitForTimeout(1200);
  out.timeAfter = await page.inputValue('[role=dialog] input[aria-label="Starts time"]');
  out.endAfter = await page.inputValue('[role=dialog] input[aria-label="Ends time"]');
  out.summary = await page.evaluate(()=>{ const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0).pop(); return d.innerText.replace(/\s+/g,' ').slice(-220); });
  await page.evaluate(()=>{ const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0).pop();
    const b=[...d.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0).find(x=>/^Schedule meeting$/i.test((x.innerText||'').trim())); if(b) b.click(); });
  await page.waitForTimeout(6000);
  out.after = await page.evaluate(()=>{ const vis=el=>el.getBoundingClientRect().width>0;
    const dlgs=[...document.querySelectorAll('[role=dialog]')].filter(vis);
    const t=document.body.innerText.replace(/\s+/g,' ');
    return { dlgOpen:dlgs.length, dlgTail: dlgs.length? dlgs[dlgs.length-1].innerText.replace(/\s+/g,' ').slice(-300):null,
             err:(t.match(/.{0,60}(required|must be|invalid|error|cannot).{0,80}/i)||[])[0]||null,
             sched:(t.match(/Scheduled today.{0,220}/)||[])[0]||null }; });
  return out;
};
