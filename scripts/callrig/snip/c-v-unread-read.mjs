// Finding 5, step 2: read the armed recorder, then reload and re-read the sidebar.
export default async ({page}) => {
  const rec = await page.evaluate(()=>{
    clearInterval(window.__urIv);
    const r=window.__ur||[];
    const key=s=>JSON.stringify(s.rows);
    const changes=[]; let prev=null;
    for(const s of r){ const k=key(s); if(k!==prev){changes.push({t:s.t, rows:s.rows, vis:s.vis, openMsgs:s.openMsgs}); prev=k;} }
    const liveMsgs=[]; let pm=null;
    for(const s of r){ if(s.openMsgs!==pm){liveMsgs.push({t:s.t, openMsgs:s.openMsgs}); pm=s.openMsgs;} }
    const anyUnread = r.some(s=>s.rows.some(x=>/unread/i.test(x.al)||/unread/i.test(x.t)));
    return {samples:r.length, spanMs:r.length?r[r.length-1].t:0, sidebarChanges:changes,
      openChannelMsgCountChanges:liveMsgs, anyUnreadLabelEverSeen:anyUnread,
      visAllVisible:r.every(s=>s.vis==='visible'), textOfOpenChannelHasControl:
        (document.body.innerText||'').includes('QA-VER-LIVE-CONTROL')};
  });
  // now reload, staying on the same route
  const url = page.url();
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(url, {waitUntil:'load'});
  await page.waitForTimeout(6000);
  const afterReload = await page.evaluate(()=>{
    const vis = e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false;
      let n=e,o=1; while(n){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; o*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return o>0.05;};
    return {url:location.pathname,
      rows:[...document.querySelectorAll('nav a[aria-label],nav button[aria-label],aside a[aria-label],aside button[aria-label]')]
        .filter(e=>vis(e)&&/qa-/.test(e.getAttribute('aria-label')||''))
        .map(e=>({al:e.getAttribute('aria-label'), t:(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,40)}))};
  });
  const unreadApi = await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/workspaces/W4QCF1XTURESO01/unread',{credentials:'include'});
    return {s:r.status, b:(await r.text()).slice(0,400)};
  });
  return {recorded:rec, afterReload, unreadApi};
};
