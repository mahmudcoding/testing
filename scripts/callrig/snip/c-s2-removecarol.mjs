export default async ({page}) => {
  const ws='W4QCF1XTURESO01', bob='U4QCBOB00000001';
  const made=await page.evaluate(async ({ws,bob})=>{
    const name='qa-c2-own-'+Math.random().toString(36).slice(2,6);
    const c=await fetch('/api/v1/channels',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({name, workspace_id:ws, type:'private'})});
    const cj=await c.json(); const id=cj.id||cj.channel_id||(cj.channel&&cj.channel.id);
    await new Promise(r=>setTimeout(r,2500));
    const a=await fetch('/api/v1/channels/members/add',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({channel_id:id,user_id:bob})});
    return {id,name,add:a.status};},{ws,bob});
  await page.waitForTimeout(3500);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${made.id}`);
  await page.waitForTimeout(11000);
  await page.locator('button[aria-label="Channel details"]').first().click({timeout:6000});
  await page.waitForTimeout(3000);
  await page.locator('button[aria-selected]').filter({hasText:/^Members/}).first().click({timeout:6000});
  await page.waitForTimeout(4500);
  const reqs=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')) reqs.push(r.method()+' '+u.split('/api/v1')[1].slice(0,42));};
  await page.evaluate(()=>{window.__c=[];document.addEventListener('click',e=>{
    const t=e.target.closest('button')||e.target;
    window.__c.push(((t.getAttribute&&t.getAttribute('aria-label'))||'').slice(0,22));},true);});
  page.on('request',onReq);
  let click='no';
  try { await page.locator('button[aria-label="Remove QA Bob"]').first().click({timeout:6000}); click='ok'; }
  catch(e){ click='FAIL '+String(e.message).split('\n')[0].slice(0,40); }
  await page.waitForTimeout(6000);
  page.off('request',onReq);
  const res=await page.evaluate(async (id)=>{
    const v=(e)=>{const b=e.getBoundingClientRect();return b.width>3&&b.height>3;};
    const r=await fetch(`/api/v1/channels/${id}/members`,{credentials:'include'});
    const j=await r.json(); const a=(j&&(j.members||j))||[];
    return {landed:window.__c, members:Array.isArray(a)?a.length:null,
      dialogs:[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(v).length};}, made.id);
  await page.evaluate(async (id)=>{await fetch(`/api/v1/channels/${id}/archive`,{method:'POST',credentials:'include'});}, made.id);
  return {owner:'third account', channel:made.name, addStatus:made.add, click,
          apiCallsAfterClick:reqs.length, calls:reqs.slice(0,3), ...res};
};
