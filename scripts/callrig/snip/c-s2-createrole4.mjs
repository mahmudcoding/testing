export default async ({page}) => {
  const out={};
  await page.locator('input[placeholder="e.g. Moderators"]').first().fill('QA Moderators');
  await page.locator('input[placeholder="What this role is for"]').first().fill('Can pin messages');
  await page.waitForTimeout(800);
  // tick the checkbox whose row says "Pin messages"
  out.ticked=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const boxes=[...document.querySelectorAll('input[type="checkbox"]')].filter(v);
    const rowText=(b)=>{let n=b;for(let i=0;i<4&&n.parentElement;i++){n=n.parentElement;
      const t=(n.innerText||'').replace(/\s+/g,' ').trim(); if(t&&t.length<60) return t;} return '';};
    const target=boxes.find(b=>/Pin messages/i.test(rowText(b)));
    if(!target) return {found:false, rows:boxes.slice(0,3).map(rowText)};
    target.click();
    return {found:true, row:rowText(target), checkedNow:target.checked};
  });
  await page.waitForTimeout(1000);
  const reqs=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')) reqs.push(r.method()+' '+u.split('/api/v1')[1].slice(0,42));};
  const bodies=[];
  const onRes=async(r)=>{const u=r.url();
    if(u.includes('/api/v1/')&&/role/i.test(u)){let b='';try{b=(await r.text()).slice(0,140);}catch{}
      bodies.push(r.status()+' '+u.split('/api/v1')[1].slice(0,40)+' '+b);}};
  page.on('request',onReq); page.on('response',onRes);
  try { await page.locator('button').filter({hasText:/^Create role$/}).last().click({timeout:6000}); out.submit='ok'; }
  catch(e){ out.submit='FAIL '+String(e.message).split('\n')[0].slice(0,40); }
  await page.waitForTimeout(7000);
  page.off('request',onReq); page.off('response',onRes);
  out.requests=reqs.slice(0,6); out.responses=bodies.slice(0,4);
  out.serverRoles=await page.evaluate(async ()=>{
    const m=location.pathname.match(/\/c\/([A-Z0-9]+)/); if(!m) return null;
    const r=await fetch(`/api/v1/channels/${m[1]}/roles`,{credentials:'include'});
    const j=await r.json(); const a=(j&&(j.roles||j))||[];
    return (Array.isArray(a)?a:[]).map(x=>`${x.name} system=${x.is_system}`);});
  return out;
};
