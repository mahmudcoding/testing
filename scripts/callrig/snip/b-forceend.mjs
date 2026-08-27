export default async ({page}) => {
  const WS='W4QBF1XTURESO01', M='V4OWCN27MWN220O';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/call/${M}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  out.buttons1 = await page.evaluate(()=>[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0).map(b=>(b.innerText||b.getAttribute('aria-label')||'').trim()).filter(Boolean).slice(-8));
  // if pre-join, press Join
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0).find(x=>/^Join$/i.test((x.innerText||'').trim())); if(b) b.click(); });
  await page.waitForTimeout(8000);
  out.buttons2 = await page.evaluate(()=>[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0).map(b=>(b.innerText||b.getAttribute('aria-label')||'').trim()).filter(Boolean).slice(-8));
  out.endClicked = await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0).find(x=>/End for everyone/i.test((x.innerText||x.getAttribute('aria-label')||''))); if(b){b.click(); return true;} return false; });
  await page.waitForTimeout(2500);
  await page.evaluate(()=>{ const b=document.querySelector('[data-testid="call-end-confirm-submit"]')||[...document.querySelectorAll('[role=dialog] button,[role=alertdialog] button')].find(x=>/^End for everyone$/i.test((x.innerText||'').trim())); if(b) b.click(); });
  await page.waitForTimeout(7000);
  out.active = await page.evaluate(async(ws)=>{ const r=await fetch(`/api/v1/workspace/${ws}/meetings/active`,{credentials:'include'}); const j=await r.json().catch(()=>null); const a=(j&&(j.meetings||j.items))||(Array.isArray(j)?j:[]); return Array.isArray(a)?a.length:'?'; }, WS);
  return out;
};
