export default async ({page}) => {
  const ws='W4QBF1XTURESO01';
  const target=process.env.QA_TARGET||'Alice';
  const action=process.env.QA_ACTION||'Block';
  await page.goto(`https://airion-cargo.store/w/${ws}/directories?tab=people&intent=dm`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  const opened = await page.evaluate((t)=>{
    const row=[...document.querySelectorAll('button,a')].filter(e=>{
      const r=e.getBoundingClientRect(); return r.width>60&&r.height>20&&new RegExp(t,'i').test(e.innerText||'');})[0];
    if(!row) return false; row.click(); return (row.innerText||'').replace(/\s+/g,' ').trim().slice(0,30);
  }, target);
  await page.waitForTimeout(3000);
  const card = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0)[0];
    if(!d) return null;
    return {text:(d.innerText||'').replace(/\s+/g,' ').slice(0,140),
      btns:[...d.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0)
        .map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,22))};
  });
  const clicked = await page.evaluate((act)=>{
    const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0)[0];
    if(!d) return null;
    const b=[...d.querySelectorAll('button')].find(x=>new RegExp('^'+act+'$','i').test((x.innerText||'').trim()));
    if(!b) return null; b.click(); return act;
  }, action);
  await page.waitForTimeout(2500);
  const confirm = await page.evaluate((act)=>{
    const ds=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(x=>x.getBoundingClientRect().width>0);
    const d=ds[ds.length-1]; if(!d) return null;
    const t=(d.innerText||'').replace(/\s+/g,' ').slice(0,160);
    const b=[...d.querySelectorAll('button')].find(x=>new RegExp('^('+act+'|confirm|yes)$','i').test((x.innerText||'').trim()));
    if(b) b.click(); return {text:t, confirmed:!!b};
  }, action);
  await page.waitForTimeout(3500);
  const after = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0)[0];
    return d?{btns:[...d.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0)
      .map(b=>(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,20))}:{dialogClosed:true};
  });
  return {opened, card, clicked, confirm, after};
};
