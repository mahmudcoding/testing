export default async ({page}) => {
  const ws='W4QCF1XTURESO01', dm='C4OVEWOTJW1AA86';
  await page.goto(`https://airion-cargo.store/w/${ws}/d/${dm}`);
  await page.waitForTimeout(13000);
  const ui=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const c=document.querySelector('div[contenteditable][aria-label="Compose message"]');
    const main=document.querySelector('main');
    const txt=main?(main.innerText||''):'';
    let vis=null;
    if(c){let op=1,n=c;
      while(n&&n!==document.documentElement){const s=getComputedStyle(n);
        op*=parseFloat(s.opacity||'1');
        if(s.display==='none'||s.visibility==='hidden'){op=0;break;} n=n.parentElement;}
      vis=+op.toFixed(2);}
    return {composerPresent:!!c, composerEditable:c?c.getAttribute('contenteditable'):null,
      composerOpacity:vis,
      sendPresent:!!document.querySelector('button[aria-label="Send"]'),
      blockNotice:/blocked|block/i.test(txt),
      mainTail:txt.replace(/\s+/g,' ').trim().slice(-150),
      messages:document.querySelectorAll('main [data-message-id]').length};});
  const api=await page.evaluate(async (dm)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:dm, body:'QA-BLOCKDM probe'})});
    let j=null; try{j=await r.json()}catch{}
    return {status:r.status, key:j&&j.key, message:(j&&j.message||'').slice(0,60)};}, dm);
  return {blockedPartyView:ui, sendAttempt:api};
};
