export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{ const u=r.url(); if(!/\/api\/v1\//.test(u)) return;
    let b=null; try{ b=await r.text(); }catch(e){}
    net.push({m:r.request().method(), u:u.split('/api/v1/')[1].slice(0,80), s:r.status(), len:(b||'').length,
              hasBob:/U4QABOB00000001|QA Bob/.test(b||''), hasOurMeeting:/S4OV0EO12BSAOAQ/.test(b||''),
              snippet:/S4OV0EO12BSAOAQ/.test(b||'')?(b||'').slice((b||'').indexOf('S4OV0EO12BSAOAQ')-60,(b||'').indexOf('S4OV0EO12BSAOAQ')+420):null}); });
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calendar',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  out.who = await page.evaluate(async()=>{const j=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json().catch(()=>null); return j?.email??j?.data?.email;});
  out.calendarRequests = net.filter(n=>/calendar|meeting/i.test(n.u)).map(n=>`${n.m} ${n.u} -> ${n.s} (${n.len}b) bob=${n.hasBob} ours=${n.hasOurMeeting}`);
  const withMeeting = net.find(n=>n.hasOurMeeting && /calendar/i.test(n.u));
  out.meetingSnippet = withMeeting?.snippet || null;
  return out;
};
