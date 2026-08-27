export default async ({page}) => {
  const out={};
  const posts=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')&&r.method()!=='GET')
    posts.push(r.method()+' '+u.split('/api/v1')[1].slice(0,44));};
  page.on('request',onReq);
  await page.evaluate(()=>{window.__c=[];document.addEventListener('click',e=>{
    const t=e.target.closest('button')||e.target;
    window.__c.push(((t.getAttribute&&t.getAttribute('aria-label'))||'').slice(0,22));},true);});
  await page.locator('button[aria-label="Grinning face"]').first().click({timeout:6000}).catch(e=>{out.err='FAIL';});
  await page.waitForTimeout(5000);
  page.off('request',onReq);
  out.landed=await page.evaluate(()=>window.__c);
  out.requests=posts.slice(0,3);
  out.result=await page.evaluate(async ()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const el=[...document.querySelectorAll('main [data-message-id]')].pop();
    const r=await fetch('/api/v1/messaging/channels/C4QCGENERAL0001/messages?limit=2',{credentials:'include'});
    const j=await r.json(); const m=(j&&j.messages)||[];
    const last=m[m.length-1];
    return {reactionChips:el?[...el.querySelectorAll('button')].filter(v)
        .map(b=>b.getAttribute('aria-label')||'').filter(t=>/reaction/i.test(t)).slice(0,3):[],
      serverReactions:JSON.stringify(last&&last.reactions||[]).slice(0,70)};});
  return out;
};
