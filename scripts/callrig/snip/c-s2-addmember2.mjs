export default async ({page}) => {
  const out={};
  const ch=await page.evaluate(()=>location.pathname.match(/\/c\/([A-Z0-9]+)/)[1]);
  out.channel=ch.slice(-6);
  out.before=await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/channels/${ch}/members`,{credentials:'include'});
    const j=await r.json(); const a=(j&&(j.members||j))||[];
    return Array.isArray(a)?a.length:null;}, ch);
  const pick=page.locator('[role="dialog"] button').filter({hasText:'QA Bob'}).first();
  out.pickFound=await pick.count();
  if(out.pickFound) await pick.click({timeout:6000}).catch(()=>{out.pickErr=true});
  await page.waitForTimeout(1800);
  const reqs=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')&&r.method()!=='GET')
    reqs.push(r.method()+' '+u.split('/api/v1')[1].slice(0,40));};
  page.on('request',onReq);
  await page.locator('[role="dialog"] button').filter({hasText:/^Add selected$/}).first()
    .click({timeout:6000}).catch(e=>{out.addErr=String(e.message).slice(0,40);});
  await page.waitForTimeout(7000);
  page.off('request',onReq);
  out.requests=reqs.slice(0,3);
  out.after=await page.evaluate(async (ch)=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const r=await fetch(`/api/v1/channels/${ch}/members`,{credentials:'include'});
    const j=await r.json(); const a=(j&&(j.members||j))||[];
    return {members:Array.isArray(a)?a.length:null,
      names:(Array.isArray(a)?a:[]).map(m=>m.name||m.display_name||m.user_id).slice(0,4),
      dialogsOpen:[...document.querySelectorAll('[role="dialog"]')].filter(v).length};}, ch);
  await page.evaluate(async (ch)=>{await fetch(`/api/v1/channels/${ch}/archive`,{method:'POST',credentials:'include'});}, ch);
  return out;
};
