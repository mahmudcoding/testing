export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const made = await page.evaluate(async (ws)=>{
    const name='qa-c2-roleid-'+Math.random().toString(36).slice(2,6);
    const r=await fetch('/api/v1/channels',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({name, workspace_id:ws, type:'private'})});
    let j=null; try{j=await r.json()}catch{}
    return {status:r.status, name, id:(j&&(j.id||j.channel_id||(j.channel&&j.channel.id)))||null};
  }, ws);
  if(!made.id) return {made, note:'no id, aborting'};
  await page.waitForTimeout(3000);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${made.id}`);
  await page.waitForTimeout(9000);
  let roles=null;
  try {
    await page.locator('button[aria-label="Channel details"]').first().click({timeout:6000});
    await page.waitForTimeout(2500);
    await page.locator('button', {hasText:/^Roles$/}).first().click({timeout:6000});
    await page.waitForTimeout(3000);
    roles = await page.evaluate(()=>{
      const rows=[];
      const walk=(n)=>{ for(const c of n.childNodes){
          if(c.nodeType===3 && /^R4Q[A-Z0-9]{10,}$/.test((c.textContent||'').trim()))
            rows.push({id:(c.textContent||'').trim(),
              block:(c.parentElement&&c.parentElement.parentElement&&
                (c.parentElement.parentElement.innerText||'').replace(/\s+/g,' ').trim().slice(0,50))||''});
          else if(c.nodeType===1) walk(c); } };
      walk(document.body);
      return {rawIdsShown:rows.length, sample:rows.slice(0,2)};
    });
  } catch(e){ roles={err:String(e.message).slice(0,50)}; }
  const arch = await page.evaluate(async (id)=>{
    const r=await fetch(`/api/v1/channels/${id}/archive`,{method:'POST',credentials:'include'});
    return r.status; }, made.id);
  return {createdStatus:made.status, roles, archivedStatus:arch};
};
