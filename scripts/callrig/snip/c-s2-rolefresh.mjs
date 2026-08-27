export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const made = await page.evaluate(async (ws)=>{
    const name='qa-c2-rolefresh-'+Math.random().toString(36).slice(2,6);
    const r=await fetch('/api/v1/channels',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({name, workspace_id:ws, type:'private'})});
    const j=await r.json();
    return {id:j.id||j.channel_id||(j.channel&&j.channel.id), name};
  }, ws);
  await page.waitForTimeout(4000);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${made.id}`);
  await page.waitForTimeout(10000);
  await page.locator('button[aria-label="Channel details"]').first().click({timeout:6000});
  await page.waitForTimeout(3000);
  await page.locator('button', {hasText:/^Roles$/}).first().click({timeout:6000});
  await page.waitForTimeout(9000);
  const r = await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const W=innerWidth;
    const pane=[...document.querySelectorAll('div,section,aside')].filter(v)
      .filter(e=>{const b=e.getBoundingClientRect();return b.left>W*0.7&&b.width>250&&b.height>250;})
      .sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length)[0];
    const ids=[]; const walk=(n)=>{for(const c of n.childNodes){
      if(c.nodeType===3&&/^R4[A-Z0-9]{12,}$/.test((c.textContent||'').trim())) ids.push((c.textContent||'').trim());
      else if(c.nodeType===1) walk(c);}};
    walk(document.body);
    return {paneText: pane?(pane.innerText||'').replace(/\s+/g,' ').trim().slice(0,320):'NO-PANE',
            rawIds:ids.slice(0,3)};
  });
  const arch = await page.evaluate(async (id)=>(await fetch(`/api/v1/channels/${id}/archive`,
    {method:'POST',credentials:'include'})).status, made.id);
  return {...r, archived:arch};
};
