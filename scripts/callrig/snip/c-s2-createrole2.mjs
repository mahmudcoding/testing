export default async ({page}) => {
  const out={};
  const nameIn=page.locator('input[placeholder="e.g. Moderators"]').first();
  const descIn=page.locator('input[placeholder="What this role is for"]').first();
  out.nameCount=await nameIn.count(); out.descCount=await descIn.count();
  await nameIn.fill('QA Moderators');
  await descIn.fill('Can pin and remove messages');
  await page.waitForTimeout(800);
  // tick a couple of permission checkboxes by their visible label
  out.perms=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const boxes=[...document.querySelectorAll('input[type="checkbox"],[role="checkbox"],[role="switch"]')].filter(v);
    return boxes.slice(0,4).map(b=>({tag:b.tagName.toLowerCase(),
      checked:b.checked===true||b.getAttribute('aria-checked'),
      label:(b.closest('label')?.innerText||b.getAttribute('aria-label')||'').replace(/\s+/g,' ').trim().slice(0,30)}));
  });
  const pin=page.locator('label').filter({hasText:'Pin messages'}).first();
  try { await pin.click({timeout:5000}); out.tickedPin='ok'; } catch(e){ out.tickedPin='FAIL'; }
  await page.waitForTimeout(1200);
  const reqs=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')) reqs.push(r.method()+' '+u.split('/api/v1')[1].slice(0,40));};
  page.on('request',onReq);
  try { await page.locator('button').filter({hasText:/^Create role$/}).first().click({timeout:6000}); out.submit='ok'; }
  catch(e){ out.submit='FAIL'; }
  await page.waitForTimeout(6000);
  page.off('request',onReq);
  out.requests=reqs.slice(0,6);
  out.after=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const W=innerWidth;
    const pane=[...document.querySelectorAll('div,section')].filter(v)
      .filter(e=>{const b=e.getBoundingClientRect();return b.left>W*0.7&&b.width>250&&b.height>300;})
      .sort((a,b)=>(b.innerText||'').length-(a.innerText||'').length)[0];
    return pane?(pane.innerText||'').replace(/\s+/g,' ').trim().slice(0,300):'NO-PANE';});
  return out;
};
