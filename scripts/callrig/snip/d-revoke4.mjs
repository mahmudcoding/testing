export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/invites`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const out = await page.evaluate(async(ws)=>{
    const r = await fetch(`/api/v1/workspaces/${ws}/invites`,{credentials:'include'});
    const j = await r.json();
    const list = Array.isArray(j)?j:(j.invites||j.data||[]);
    const done=[];
    for(const inv of list){
      const id=inv.id||inv.invite_id;
      const d=await fetch(`/api/v1/workspaces/invites/${id}/revoke`,{method:'POST',credentials:'include'});
      done.push({id:String(id).slice(0,18), status:d.status, body:(await d.text()).slice(0,90)});
    }
    const after = await (await fetch(`/api/v1/workspaces/${ws}/invites`,{credentials:'include'})).json();
    const afterList = Array.isArray(after)?after:(after.invites||after.data||[]);
    return {revoked:done, remaining:afterList.length, statuses:afterList.map(x=>x.status||x.state||'?')};
  }, WS);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  out.pageAfter = await page.evaluate(()=>{const m=document.querySelector('main');const t=(m.innerText||'').replace(/\s+/g,' ');const i=t.indexOf('Invite links');return t.slice(i,i+180);});
  return out;
};
