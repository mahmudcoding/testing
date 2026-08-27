const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
const PID='M4OWOZXABTSN4GW';
export default async ({page}) => {
  const out={};
  await page.goto('about:blank'); await page.waitForTimeout(700);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}?thread=${PID}`,{waitUntil:'load'});
  await page.waitForTimeout(8000);
  out.panel = await page.evaluate((pid)=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
      let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
    const body=document.body.innerText;
    return {repliesMarker:(body.match(/Replies \(\d+\)/)||[null])[0],
      errorText:(body.match(/Could not load replies\.?/)||[null])[0],
      retryVisible: [...document.querySelectorAll('button')].filter(vis).some(b=>/^Retry$/.test((b.textContent||'').trim())),
      parentRowText:(()=>{const el=document.querySelector(`[data-message-id="${pid}"]`); return el? el.innerText.replace(/\n+/g,' | ').slice(0,60):null;})(),
      channelMarker:(body.match(/\d+ repl(y|ies)/g)||[]).slice(0,4)};
  }, PID);
  out.api = await page.evaluate(async (pid)=>{
    const t=await fetch(`/api/v1/messaging/messages/${pid}/thread?limit=20`,{credentials:'include'});
    const tb=(await t.text()).slice(0,180);
    const c=await fetch('/api/v1/messaging/channels/C4QCPRIVATE0001/messages?limit=30',{credentials:'include'});
    const cj=await c.json();
    const replies=(cj.messages||[]).filter(m=>/DELTHREAD-R/.test(m.body||''));
    const parent=(cj.messages||[]).find(m=>m.id===pid);
    return {threadStatus:t.status, threadBody:tb,
      repliesInChannelList:replies.length,
      parentInChannel: parent? {body:(parent.body||''), reply_count:parent.reply_count}:null};
  }, PID);
  // click Retry and see
  const resp=[];
  page.on('response', r=>{ if(/thread/.test(r.url())) resp.push({s:r.status(), u:r.url().split('/api/v1')[1].slice(0,50)}); });
  try { await page.locator('button:visible').filter({hasText:/^Retry$/}).last().click({timeout:8000});
        await page.waitForTimeout(4000); out.retryClicked=true; } catch(e){ out.retryErr=String(e).slice(0,70); }
  out.afterRetry = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    return {errorStill:/Could not load replies/.test(document.body.innerText),
      retryStill:[...document.querySelectorAll('button')].filter(vis).some(b=>/^Retry$/.test((b.textContent||'').trim()))};
  });
  out.retryResponses = resp;
  return out;
};
