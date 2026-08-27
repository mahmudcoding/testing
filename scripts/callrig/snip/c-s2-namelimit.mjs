export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const made=await page.evaluate(async (ws)=>{
    const name='qa-c2-lim-'+Math.random().toString(36).slice(2,6);
    const c=await fetch('/api/v1/channels',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({name, workspace_id:ws, type:'private'})});
    const cj=await c.json(); return cj.id||cj.channel_id||(cj.channel&&cj.channel.id);}, ws);
  await page.waitForTimeout(3000);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${made}`);
  await page.waitForTimeout(11000);
  await page.locator('button[aria-label="Channel details"]').first().click({timeout:6000});
  await page.waitForTimeout(3500);
  const out={};
  const field=page.locator('input:visible').first();
  out.fieldAttrs=await field.evaluate(e=>({maxlength:e.getAttribute('maxlength'),
    type:e.type, value:(e.value||'').slice(0,20)}));
  out.counterNearField=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const W=innerWidth;
    return [...document.querySelectorAll('*')].filter(v).filter(e=>e.children.length===0)
      .filter(e=>e.getBoundingClientRect().left>W*0.7)
      .map(e=>(e.innerText||'').trim()).filter(t=>/^\d+\s*\/\s*\d+$/.test(t));});
  await field.fill('x'.repeat(200));
  await page.waitForTimeout(800);
  out.afterTyping200={value:(await field.inputValue()).length};
  const reqs=[];
  const onReq=async(r)=>{const u=r.url();
    if(u.includes('/api/v1/channels')&&r.method()==='PATCH'){
      try{reqs.push('PATCH len='+JSON.parse(r.postData()||'{}').name.length);}catch(e){}}};
  page.on('request',onReq);
  await page.locator('button').filter({hasText:/^Save$/}).first().click({timeout:6000}).catch(()=>{out.saveFail=true});
  await page.waitForTimeout(6000);
  page.off('request',onReq);
  out.requests=reqs;
  out.errorShown=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const W=innerWidth;
    return [...document.querySelectorAll('*')].filter(v).filter(e=>e.children.length===0)
      .filter(e=>e.getBoundingClientRect().left>W*0.65)
      .map(e=>(e.innerText||'').trim())
      .filter(t=>t && t.length<90 && /error|too long|invalid|не удал|ошиб|длин/i.test(t)).slice(0,3);});
  await page.evaluate(async (id)=>{await fetch(`/api/v1/channels/${id}/archive`,{method:'POST',credentials:'include'});}, made);
  return out;
};
