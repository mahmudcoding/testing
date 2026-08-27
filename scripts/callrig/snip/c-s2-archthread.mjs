export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const made=await page.evaluate(async (ws)=>{
    const name='qa-c2-athr-'+Math.random().toString(36).slice(2,6);
    const c=await fetch('/api/v1/channels',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({name, workspace_id:ws, type:'private'})});
    const cj=await c.json(); const id=cj.id||cj.channel_id||(cj.channel&&cj.channel.id);
    await new Promise(r=>setTimeout(r,2500));
    const p=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:id, body:'QA-ATHR parent'})});
    const pj=await p.json(); const pid=pj.id||pj.message?.id;
    await new Promise(r=>setTimeout(r,1500));
    await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:id, body:'QA-ATHR reply', parent_id:pid})});
    await new Promise(r=>setTimeout(r,1800));
    const ar=await fetch(`/api/v1/channels/${id}/archive`,{method:'POST',credentials:'include'});
    return {id, name, pid, archived:ar.status};}, ws);
  await page.waitForTimeout(3000);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${made.id}?thread=${made.pid}`);
  await page.waitForTimeout(12000);
  const ui=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const comps=[...document.querySelectorAll('div[contenteditable]')].filter(v)
      .map(c=>({label:c.getAttribute('aria-label')||'(none)', editable:c.getAttribute('contenteditable'),
        w:Math.round(c.getBoundingClientRect().width)}));
    const main=document.querySelector('main');
    return {contentEditables:comps,
      sendButtons:[...document.querySelectorAll('button[aria-label="Send"]')].filter(v).length,
      threadText:(main?(main.innerText||''):'').replace(/\s+/g,' ').trim().slice(-160)};});
  return {channel:made.name, archiveStatus:made.archived, ui};
};
