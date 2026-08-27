export default async ({page}) => {
  const out={};
  out.api=await page.evaluate(async ()=>{
    const tries=['/api/v1/notifications?limit=20',
                 '/api/v1/notifications?limit=20&read=true',
                 '/api/v1/notifications?limit=20&status=all',
                 '/api/v1/notifications?limit=20&include_read=true'];
    const r=[];
    for(const u of tries){
      const res=await fetch(u,{credentials:'include'});
      let j=null; try{j=await res.json()}catch{}
      const a=(j&&(j.notifications||j.items))||[];
      r.push({q:u.split('notifications')[1], status:res.status,
        n:Array.isArray(a)?a.length:null,
        keys:j?Object.keys(j).slice(0,5):null});
    }
    return r;});
  const bell=page.locator('button[aria-label*="Notifications"]').first();
  await bell.click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(4000);
  out.panel=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const p=[...document.querySelectorAll('div,section,aside')].filter(v)
      .filter(e=>/^Notifications/i.test((e.innerText||'').trim().slice(0,20)))
      .sort((a,b)=>(b.innerText||'').length-(a.innerText||'').length)[0];
    if(!p) return 'NO-PANEL';
    return {text:(p.innerText||'').replace(/\s+/g,' ').trim().slice(0,180),
      entryButtons:[...p.querySelectorAll('button')].filter(v)
        .filter(b=>/:/.test(b.getAttribute('aria-label')||'')).length};});
  return out;
};
