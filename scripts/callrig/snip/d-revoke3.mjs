export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/invites`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  // ancestor-chain check on the Revoke button before we remove the row
  const vis = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('main button')].find(x=>(x.innerText||'').trim()==='Revoke invite');
    if(!b) return 'not found';
    let n=b, chain=[], op=1;
    while(n && n!==document.documentElement){
      const cs=getComputedStyle(n); op*=parseFloat(cs.opacity||'1');
      const r=n.getBoundingClientRect();
      chain.push({tag:n.tagName.toLowerCase(), disp:cs.display, vis:cs.visibility, ov:cs.overflow, h:Math.round(r.height), w:Math.round(r.width)});
      n=n.parentElement;
      if(chain.length>6) break;
    }
    return {opacityProduct:op, chain};
  });
  const revoked = await page.evaluate(async(ws)=>{
    const r = await fetch(`/api/v1/workspaces/${ws}/invites`,{credentials:'include'});
    let list=null; try{const j=await r.json(); list=Array.isArray(j)?j:(j.invites||j.data||[]);}catch(e){}
    if(!list||!list.length) return {listStatus:r.status, note:'no invites listed', sample:JSON.stringify(list||'').slice(0,150)};
    const out=[];
    for(const inv of list){
      const id=inv.id||inv.invite_id||inv.token;
      const d=await fetch(`/api/v1/workspaces/invites/${id}`,{method:'DELETE',credentials:'include'});
      out.push({id:String(id).slice(0,18), status:d.status});
    }
    return {listStatus:r.status, deleted:out};
  }, WS);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const after = await page.evaluate(()=>{const m=document.querySelector('main');const t=(m.innerText||'').replace(/\s+/g,' ');const i=t.indexOf('Invite links');return t.slice(i,i+160);});
  return {vis, revoked, after};
};
