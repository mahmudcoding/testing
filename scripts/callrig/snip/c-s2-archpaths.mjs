export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={reqs:[]};
  const arch=await page.evaluate(async(ws)=>{
    const r=await fetch(`/api/v1/users/me/channels/archived?workspace_id=${ws}`,{credentials:'include'});
    const j=await r.json(); const arr=j.channels||j.data||(Array.isArray(j)?j:[]);
    return Array.isArray(arr)? arr.map(c=>({id:c.id,name:c.name})):[];}, ws);
  out.archived=arch;
  let target=null;
  for(const c of arch){
    const m=await page.evaluate(async(id)=>{
      const j=await (await fetch(`/api/v1/messaging/channels/${id}/messages?limit=3`,{credentials:'include'})).json();
      const ms=j.messages||j.data||j||[]; return ms.length? ms[0].id:null;}, c.id);
    if(m){ target={...c, msg:m}; break; }
  }
  out.target=target;
  if(!target) return out;
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${target.id}`);
  await page.waitForTimeout(7500);
  const el=page.locator(`[data-message-id="${target.msg}"]`).first();
  if(!await el.count()){ out.err='message not rendered'; return out; }
  const onReq=async(r)=>{ if(r.url().includes('/api/v1/')&&r.method()!=='GET')
    out.reqs.push({m:r.method(), u:r.url().split('/api/v1')[1], body:(r.postData()||'').slice(0,40)}); };
  const onResp=async(r)=>{ if(r.url().includes('/api/v1/')&&r.request().method()!=='GET')
    out.reqs.push({resp:r.status(), u:r.url().split('/api/v1')[1]}); };
  page.on('request', onReq); page.on('response', onResp);
  // reaction
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(600);
  await el.locator('button[aria-label="Add reaction"]').first().click();
  await page.waitForTimeout(1800);
  const pt=await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button[frimousse-emoji], [role="gridcell"]')]
      .filter(x=>{const r=x.getBoundingClientRect();return r.width>8&&r.height>8;})[2];
    if(!b) return null;
    const r=b.getBoundingClientRect();
    return {x:Math.round(r.x+r.width/2), y:Math.round(r.y+r.height/2), t:(b.textContent||'').trim()};});
  out.picked=pt;
  if(pt) await page.mouse.click(pt.x, pt.y);
  await page.waitForTimeout(2500);
  // pin
  await el.hover(); await page.waitForTimeout(500);
  await el.locator('button[aria-label="More actions"]').first().click({force:true});
  await page.waitForTimeout(900);
  const pin=page.locator('[role="menu"]').getByText(/^(Pin message|Unpin message)$/).first();
  out.pinItem=await pin.count()? await pin.innerText():'none';
  if(await pin.count()) await pin.click();
  await page.waitForTimeout(2800);
  page.off('request', onReq); page.off('response', onResp);
  return out;
};
