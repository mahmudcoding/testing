export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OXCK0OB50583Z';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(10000);
  await page.locator('button[aria-label="Channel details"]').first().click({timeout:6000});
  await page.waitForTimeout(3000);
  await page.locator('button[aria-selected]').filter({hasText:/^Roles/}).first().click({timeout:6000});
  await page.waitForTimeout(5000);
  const out={};
  const pick=async(label,optionText)=>{
    const b=page.locator(`button[aria-label="${label}"]`).first();
    for(let i=0;i<3;i++){
      await b.click({timeout:6000}).catch(()=>{});
      await page.waitForTimeout(2200);
      const n=await page.locator('[role="option"],[role="menuitem"]').count();
      if(n>0) break;
    }
    const opt=page.locator('[role="option"],[role="menuitem"]').filter({hasText:optionText}).first();
    if(!await opt.count()) return 'option not found';
    await opt.click({timeout:6000});
    await page.waitForTimeout(2000);
    return page.evaluate((l)=>{const b=document.querySelector(`button[aria-label="${l}"]`);
      return b?(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,26):'gone';}, label);
  };
  out.pickedMember=await pick('Member','QA Bob');
  out.pickedRole=await pick('Role','QA Moderators');
  const reqs=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')) reqs.push(r.method()+' '+u.split('/api/v1')[1].slice(0,44));};
  page.on('request',onReq);
  try { await page.locator('button[aria-label="Assign role"], button:has-text("Assign role")').first().click({timeout:6000}); out.assignClick='ok'; }
  catch(e){ out.assignClick='FAIL'; }
  await page.waitForTimeout(6000);
  page.off('request',onReq);
  out.requests=reqs.slice(0,5);
  out.serverCheck=await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/channels/${ch}/roles`,{credentials:'include'});
    const j=await r.json(); const a=(j&&(j.roles||j))||[];
    return (Array.isArray(a)?a:[]).map(x=>`${x.name} system=${x.is_system}`);}, ch);
  return out;
};
