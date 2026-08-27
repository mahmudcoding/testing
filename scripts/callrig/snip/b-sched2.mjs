export default async ({page}) => {
  const out={};
  const d = await page.$('[role=dialog]');
  if(!d) return {noDialog:true};
  out.dialogText = await page.evaluate(()=>{ const x=[...document.querySelectorAll('[role=dialog]')].filter(y=>y.getBoundingClientRect().width>0).pop(); return x? x.innerText.replace(/\n{2,}/g,'\n').slice(0,600):null; });
  // title
  const ti = await d.$('input[type=text]');
  if (ti) await ti.fill('QA scheduled start');
  // add Bob via member search
  const search = await d.$('input[type=search]');
  if (search) { await search.fill('Bob'); await page.waitForTimeout(2200);
    out.picked = await page.evaluate(()=>{
      const dd=[...document.querySelectorAll('[role=dialog]')].filter(y=>y.getBoundingClientRect().width>0).pop();
      const cand=[...dd.querySelectorAll('button,li,[role=option]')].filter(e=>e.getBoundingClientRect().width>0 && /Bob/.test(e.innerText||''));
      if(cand.length){ cand[0].click(); return (cand[0].innerText||'').replace(/\s+/g,' ').slice(0,40); } return null;
    });
    await page.waitForTimeout(1500);
  }
  out.submitBtns = await page.evaluate(()=>{ const dd=[...document.querySelectorAll('[role=dialog]')].filter(y=>y.getBoundingClientRect().width>0).pop(); return [...dd.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0).map(b=>(b.innerText||'').trim()).filter(Boolean).slice(0,12); });
  await page.evaluate(()=>{ const dd=[...document.querySelectorAll('[role=dialog]')].filter(y=>y.getBoundingClientRect().width>0).pop();
    const b=[...dd.querySelectorAll('button')].find(x=>/^(Schedule|Create|Save|Schedule meeting)$/i.test((x.innerText||'').trim())); if(b) b.click(); });
  await page.waitForTimeout(5000);
  out.after = await page.evaluate(async()=>{
    const vis = el => el.getBoundingClientRect().width>0;
    const t=document.body.innerText.replace(/\s+/g,' ');
    return { dlgOpen: [...document.querySelectorAll('[role=dialog]')].filter(vis).length,
      err: (t.match(/.{0,40}(required|must be|invalid|error).{0,60}/i)||[])[0]||null,
      scheduled: (t.match(/Scheduled today.{0,180}/)||[])[0]||null };
  });
  return out;
};
