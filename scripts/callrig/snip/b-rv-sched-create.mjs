export default async ({page}) => {
  const out={};
  const dlg = () => page.evaluate(()=>!![...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0).length);
  if (!(await dlg())) return {noDialog:true};
  const title = process.env.QA_TITLE || 'QA sched reverify';
  await page.fill('[role=dialog] input[aria-label="Add title"]', title);
  await page.waitForTimeout(600);
  out.submit = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0).pop();
    const b=[...d.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0).find(x=>/^Schedule meeting$/i.test((x.innerText||'').trim()));
    if(b){ b.click(); return true; } return false;
  });
  await page.waitForTimeout(5000);
  out.after = await page.evaluate(async()=>{
    const vis = el => el.getBoundingClientRect().width>0;
    const t=document.body.innerText.replace(/\s+/g,' ');
    return { dlgOpen: [...document.querySelectorAll('[role=dialog]')].filter(vis).length,
             sched: (t.match(/Scheduled today.{0,300}/)||[])[0]||null,
             live: (t.match(/Live now.{0,200}/)||[])[0]||null };
  });
  return out;
};
