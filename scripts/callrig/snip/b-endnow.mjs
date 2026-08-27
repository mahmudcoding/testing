export default async ({page}) => {
  const WS='W4QBF1XTURESO01';
  const out={};
  out.cur = await page.evaluate(async()=>{ const j=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json().catch(()=>null); return j&&j.meeting?j.meeting.id:null; });
  if (out.cur) {
    await page.goto(`https://airion-cargo.store/w/${WS}/call/${out.cur}`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(6000);
  }
  out.clicked = await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0).find(x=>/End for everyone/i.test((x.innerText||x.getAttribute('aria-label')||''))); if(b){b.click(); return true;} return false; });
  await page.waitForTimeout(2500);
  await page.evaluate(()=>{ const b=document.querySelector('[data-testid="call-end-confirm-submit"]')||[...document.querySelectorAll('[role=dialog] button,[role=alertdialog] button')].find(x=>/^End for everyone$/i.test((x.innerText||'').trim())); if(b) b.click(); });
  await page.waitForTimeout(7000);
  out.after = await page.evaluate(async()=>{ const j=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json().catch(()=>null); return j&&j.meeting?j.meeting.id:'ended'; });
  return out;
};
