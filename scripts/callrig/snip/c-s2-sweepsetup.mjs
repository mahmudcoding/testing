export default async ({page}) => {
  const ws='W4QCF1XTURESO01', bob='U4QCBOB00000001';
  const made = await page.evaluate(async ({ws,bob})=>{
    const name='qa-c2-sweep-'+Math.random().toString(36).slice(2,6);
    const c=await fetch('/api/v1/channels',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({name, workspace_id:ws, type:'private'})});
    const cj=await c.json();
    const id=cj.id||cj.channel_id||(cj.channel&&cj.channel.id);
    await new Promise(r=>setTimeout(r,2500));
    const a=await fetch('/api/v1/channels/members/add',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:id,user_id:bob})});
    await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:id,body:'QA-SWEEP-seed'})});
    return {id,name,addStatus:a.status};
  },{ws,bob});
  await page.waitForTimeout(3000);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${made.id}`);
  await page.waitForTimeout(10000);
  await page.locator('button[aria-label="Channel details"]').first().click({timeout:6000});
  await page.waitForTimeout(3500);
  const tabs={};
  for (const t of ['About','Members','Roles','Files','Pinned']) {
    try {
      await page.locator('button[aria-selected]').filter({hasText:new RegExp('^'+t)}).first().click({timeout:6000});
      await page.waitForTimeout(4000);
      tabs[t]=await page.evaluate(()=>{
        const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
        const W=innerWidth;
        return [...new Set([...document.querySelectorAll('button,input,select,textarea,[role="switch"],[role="checkbox"]')]
          .filter(v).filter(e=>e.getBoundingClientRect().left>W*0.72)
          .map(e=>`${e.tagName.toLowerCase()}:${(e.getAttribute('aria-label')||e.innerText||e.getAttribute('placeholder')||'(no name)').replace(/\s+/g,' ').trim().slice(0,30)}`))];
      });
    } catch(e){ tabs[t]='tab click failed'; }
  }
  return {channel:made.name, id:made.id, addStatus:made.addStatus, tabs};
};
