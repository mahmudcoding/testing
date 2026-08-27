export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const res={};
  // the language button is the one inside the region/language block
  const btns = await page.evaluate(()=>{
    const o=[]; document.querySelectorAll('main button').forEach((x,i)=>{const r=x.getBoundingClientRect(); if(r.width>0&&r.height>0) o.push({i, l:(x.innerText||'').trim().slice(0,26)});});
    return o;
  });
  res.buttonsBefore = btns;
  const target = btns.find(b=>/Русский|English|Ўзбек|O'zbek|Узбек/i.test(b.l));
  if(!target) return {...res, err:'language button not found'};
  await page.locator('main button').nth(target.i).click();
  await page.waitForTimeout(2200);
  res.items = await page.evaluate(()=>{
    const seen=new Set(), o=[];
    document.querySelectorAll('[role="dialog"] *, [data-radix-popper-content-wrapper] *').forEach(x=>{
      const t=(x.innerText||'').trim();
      const r=x.getBoundingClientRect();
      if(t && t.length<28 && r.width>0 && r.height>0 && x.children.length===0 && !seen.has(t)){seen.add(t); o.push(t);}
    });
    return o;
  });
  // click the English entry, whatever it is called now
  let done=false;
  for (const label of ['English','Английский','Ingliz']) {
    try { await page.getByText(label,{exact:true}).last().click({timeout:4000}); done=true; break; } catch(e){}
  }
  res.clicked=done;
  await page.waitForTimeout(4000);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  res.final = await page.evaluate(()=>{const m=document.querySelector('main');const t=(m.innerText||'').replace(/\s+/g,' ');return {sample:t.slice(150,330), cyr:(t.match(/[А-Яа-я]/g)||[]).length};});
  return res;
};
