export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`, {waitUntil:'load'});
  await page.waitForTimeout(4000);
  const dom = await page.evaluate(() => {
    const vis = e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false;
      let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;};
    const all=[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&e.textContent.trim()&&vis(e));
    const pin=all.filter(e=>/Pinned message|no message text|View all/i.test(e.textContent));
    const start=all.filter(e=>/Start this channel|Add teammates|Add users/i.test(e.textContent));
    const box = e => {const r=e.getBoundingClientRect(); return {t:Math.round(r.top),l:Math.round(r.left),w:Math.round(r.width),h:Math.round(r.height)};};
    return {pinNodes:pin.map(e=>({t:e.textContent.trim().slice(0,50), ...box(e)})),
            startNodes:start.map(e=>({t:e.textContent.trim().slice(0,60), ...box(e)})),
            msgCount:document.querySelectorAll('[data-message-id]').length};
  });
  const api = await page.evaluate(async () => {
    const out={};
    for(const u of ['/api/v1/messaging/channels/C4QCGENERAL0001/pinned','/api/v1/messaging/channels/C4QCGENERAL0001/pinned-messages','/api/v1/messaging/channels/C4QCGENERAL0001/pins']){
      const r=await fetch(u,{credentials:'include'});
      out[u.split('/').pop()]={s:r.status,b:(await r.text()).slice(0,220)};
    }
    const c=await fetch('/api/v1/messaging/channels/C4QCGENERAL0001',{credentials:'include'});
    out.channel={s:c.status,b:(await c.text()).slice(0,400)};
    return out;
  });
  return {dom, api};
};
