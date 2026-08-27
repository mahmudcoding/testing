export default async ({page}) => {
  const WS='W4QBF1XTURESO01', M='V4OWBHJW4AMD20S';
  const out={};
  // leave the call
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>/^Leave call$/i.test((x.getAttribute('aria-label')||x.innerText||'').trim())); if(b) b.click(); });
  await page.waitForTimeout(2000);
  await page.evaluate(()=>{ const d=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(x=>x.getBoundingClientRect().width>0).find(x=>/Leave this call\?/i.test(x.innerText)); if(d){ const b=[...d.querySelectorAll('button')].find(y=>(y.innerText||'').trim()==='Leave'); if(b) b.click(); } });
  await page.waitForTimeout(5000);
  out.leftApi = await page.evaluate(async()=>{ const j=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json().catch(()=>null); return j&&j.meeting?j.meeting.id:null; });
  // rejoin
  await page.goto(`https://airion-cargo.store/w/${WS}/call/${M}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0).find(x=>/^Join$/i.test((x.innerText||'').trim())); if(b) b.click(); });
  await page.waitForTimeout(5000);
  out.gateShown = await page.evaluate(()=>!!document.querySelector('input[type=password]'));
  const tryPw = async (pw) => {
    const i = await page.$('input[type=password]');
    if(!i) return 'no-gate';
    await i.fill(pw); await page.waitForTimeout(300);
    await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0).find(x=>/^Join call$/i.test((x.innerText||'').trim())); if(b) b.click(); });
    await page.waitForTimeout(5000);
    return await page.evaluate(async()=>{ const j=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json().catch(()=>null);
      return {inCall: j&&j.meeting?j.meeting.id:null, err: (document.body.innerText.match(/Incorrect password[^.]*\./i)||[])[0]||null, gate: !!document.querySelector('input[type=password]')}; });
  };
  out.tryOld = await tryPw('Secret123');
  return out;
};
