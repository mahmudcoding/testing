export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/saved`);
  await page.waitForTimeout(11000);
  const out={url:'/chat/saved'};
  await page.locator('button[aria-label="Channel details"]').first().click({timeout:6000}).catch(()=>{out.openFail=true});
  await page.waitForTimeout(4000);
  out.panel=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const W=innerWidth;
    const tabs=[...document.querySelectorAll('button[aria-selected]')].filter(v)
      .map(e=>`${(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,12)}=${e.getAttribute('aria-selected')}`);
    const pane=[...document.querySelectorAll('div,section,aside')].filter(v)
      .filter(e=>{const b=e.getBoundingClientRect();return b.left>W*0.7&&b.width>250&&b.height>250;})
      .sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length)[0];
    return {tabs, text:pane?(pane.innerText||'').replace(/\s+/g,' ').trim().slice(0,240):'NO-PANE'};});
  // what does Add users do here?
  const reqs=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')) reqs.push(r.method()+' '+u.split('/api/v1')[1].slice(0,44));};
  page.on('request',onReq);
  await page.locator('button').filter({hasText:/^Add users$/}).first().click({timeout:6000}).catch(()=>{out.addFail=true});
  await page.waitForTimeout(4000);
  page.off('request',onReq);
  out.addUsersRequests=reqs.slice(0,3);
  out.addUsersDialog=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(v)[0];
    return d?{text:(d.innerText||'').replace(/\s+/g,' ').trim().slice(0,150),
      buttons:[...new Set([...d.querySelectorAll('button')].filter(v)
        .map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,20)))]}:null;});
  return out;
};
