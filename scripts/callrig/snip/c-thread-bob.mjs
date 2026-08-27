export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001', pid='M4OWBL8RRJ67APK';
  const V=`(e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;})`;
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, {waitUntil:'load'});
  await page.waitForTimeout(4500);
  const inChannel = await page.evaluate(v=>{const vv=eval(v);
    const m=document.querySelector(`[data-message-id="M4OWBL8RRJ67APK"]`);
    return {found:!!m, text:m?m.innerText.replace(/\s+/g,' ').slice(0,120):null,
      markers:[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&/reply|replies/i.test(e.textContent)&&vv(e)).map(e=>e.textContent.trim().slice(0,30)),
      channelHasReplyBody:/THREAD-REPLY-1/.test(document.body.innerText)};}, V);
  // open the thread via deep link
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}?thread=${pid}`, {waitUntil:'load'});
  await page.waitForTimeout(4000);
  const panel = await page.evaluate(v=>{const vv=eval(v);
    return {replyVisible:/THREAD-REPLY-1/.test(document.body.innerText),
      markers:[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&/replies|reply/i.test(e.textContent)&&vv(e)).map(e=>e.textContent.trim().slice(0,30)),
      composers:[...document.querySelectorAll('div[contenteditable="true"]')].filter(vv).length};}, V);
  return {inChannel, threadPanel: panel};
};
