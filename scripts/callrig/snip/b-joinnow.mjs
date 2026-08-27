export default async ({page}) => {
  const WS='W4QBF1XTURESO01';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/c/C4QBGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  out.joinClicked = await page.evaluate(()=>{ const m=document.querySelector('main')||document.body; const b=[...m.querySelectorAll('button')].find(x=>/^Join call$/i.test((x.getAttribute('aria-label')||x.innerText||'').trim())); if(b){b.click(); return true;} return false; });
  await page.waitForTimeout(5000);
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0).find(x=>/^Join$/i.test((x.innerText||'').trim())); if(b) b.click(); });
  await page.waitForTimeout(7000);
  out.inCall = await page.evaluate(async()=>{ const j=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json().catch(()=>null); return j&&j.meeting?j.meeting.id:null; });
  return out;
};
