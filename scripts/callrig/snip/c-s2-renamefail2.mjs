export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const made=await page.evaluate(async (ws)=>{
    const name='qa-c2-rnf2-'+Math.random().toString(36).slice(2,6);
    const c=await fetch('/api/v1/channels',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({name, workspace_id:ws, type:'private'})});
    const cj=await c.json(); return {id:cj.id||cj.channel_id||(cj.channel&&cj.channel.id), name};}, ws);
  await page.waitForTimeout(3000);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${made.id}`);
  await page.waitForTimeout(11000);
  await page.locator('button[aria-label="Channel details"]').first().click({timeout:6000});
  await page.waitForTimeout(4000);
  const out={channel:made.name};
  out.visibleInputs=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...document.querySelectorAll('input,textarea')].filter(v)
      .map((e,i)=>({i, type:e.type||e.tagName.toLowerCase(),
        value:(e.value||'').slice(0,22), ph:e.getAttribute('placeholder')||''}));});
  const field=page.locator('input:visible, textarea:visible').first();
  if(!await field.count()) return out;
  await field.fill('qa-c2-renamed-probe');
  await page.waitForTimeout(900);
  out.typed=await field.inputValue();
  await page.route('**/api/v1/channels/**', r=>{
    const m=r.request().method();
    return (m==='PATCH'||m==='PUT'||m==='POST') ? r.abort('failed') : r.continue();});
  const seen=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')&&r.method()!=='GET')
    seen.push(r.method()+' '+u.split('/api/v1')[1].slice(0,40));};
  page.on('request',onReq);
  await page.locator('button').filter({hasText:/^Save$/}).first().click({timeout:6000}).catch(()=>{out.saveFail=true});
  await page.waitForTimeout(7000);
  page.off('request',onReq);
  await page.unroute('**/api/v1/channels/**');
  out.requests=seen.slice(0,3);
  out.after=await page.evaluate(async (id)=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const inp=[...document.querySelectorAll('input,textarea')].filter(v)[0];
    const r=await fetch(`/api/v1/channels/${id}`,{credentials:'include'});
    let j=null; try{j=await r.json()}catch{}
    return {fieldValue:inp?(inp.value||'').slice(0,26):'none',
      serverName:(j&&(j.name||(j.channel&&j.channel.name)))||'?',
      toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(v)
        .map(e=>(e.innerText||'').trim().slice(0,55)).filter(Boolean).slice(0,2)};}, made.id);
  await page.evaluate(async (id)=>{await fetch(`/api/v1/channels/${id}/archive`,{method:'POST',credentials:'include'});}, made.id);
  return out;
};
