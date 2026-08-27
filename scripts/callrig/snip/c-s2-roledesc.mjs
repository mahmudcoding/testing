export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const made=await page.evaluate(async (ws)=>{
    const name='qa-c2-desc-'+Math.random().toString(36).slice(2,6);
    const c=await fetch('/api/v1/channels',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({name, workspace_id:ws, type:'private'})});
    const cj=await c.json(); const id=cj.id||cj.channel_id||(cj.channel&&cj.channel.id);
    await new Promise(r=>setTimeout(r,2500));
    const rr=await fetch(`/api/v1/channels/${id}/roles`,{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({name:'QA Described', description:'Role with a description',
        permissions:[`channel.${id}.message.pin`]})});
    let rj=null; try{rj=await rr.json()}catch{}
    return {id, name, roleStatus:rr.status, roleDesc:rj&&rj.description};
  }, ws);
  await page.waitForTimeout(3000);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${made.id}`);
  await page.waitForTimeout(11000);
  await page.locator('button[aria-label="Channel details"]').first().click({timeout:6000});
  await page.waitForTimeout(3000);
  await page.locator('button[aria-selected]').filter({hasText:/^Roles/}).first().click({timeout:6000});
  await page.waitForTimeout(8000);
  const rows=await page.evaluate(()=>{
    const out=[];
    const walk=(n)=>{for(const c of n.childNodes){
      if(c.nodeType===3&&/^R4[A-Z0-9]{12,}$/.test((c.textContent||'').trim())){
        const cell=c.parentElement&&c.parentElement.parentElement;
        out.push((cell?cell.innerText:'').replace(/\s*\n\s*/g,' | ').trim().slice(0,90));
      } else if(c.nodeType===1) walk(c);}};
    walk(document.body); return out;});
  const arch=await page.evaluate(async (id)=>(await fetch(`/api/v1/channels/${id}/archive`,
    {method:'POST',credentials:'include'})).status, made.id);
  return {roleCreate:made.roleStatus, descriptionStored:made.roleDesc, roleRows:rows, archived:arch};
};
