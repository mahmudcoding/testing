export default async ({page}) => {
  const names=(process.env.QA_WHOS||'QA Alice,QA Bob,QA Dave').split(',');
  const ms=await page.$$('[role="dialog"]');
  const m=ms[ms.length-1]; if(!m) return {err:'no dialog'};
  const picked=[];
  for(const who of names){
    const rows=await m.$$('label');
    for(const r of rows){ const t=((await r.innerText())||'').replace(/\s+/g,' ').trim();
      if(t.includes(who) && !/In call|Ringing/.test(t)){ try{ await r.click(); picked.push(who); }catch(e){} break; } }
    await page.waitForTimeout(600);
  }
  const btns=await m.$$('button');
  let label=null, clicked=false;
  for(const b of btns){ const l=((await b.innerText())||'').trim();
    if(/^Invite \(\d+\)$/.test(l)){ label=l; if(!(await b.isDisabled())){ await b.click(); clicked=true; } break; } }
  await page.waitForTimeout(3000);
  return {picked, label, clicked};
};
