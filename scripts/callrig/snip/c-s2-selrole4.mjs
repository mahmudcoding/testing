export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  await page.locator('button[aria-label="Channel details"]').first().click({timeout:6000});
  await page.waitForTimeout(2500);
  await page.locator('button', {hasText:/^Roles$/}).first().click({timeout:6000});
  await page.waitForTimeout(2500);
  const btn=page.locator('button[aria-label="Automatic role"]').first();
  const st=()=>page.evaluate(()=>{
    const b=document.querySelector('button[aria-label="Automatic role"]');
    return {expanded:b&&b.getAttribute('aria-expanded'),
      popups:document.querySelectorAll('[role="listbox"],[role="menu"]').length};});
  const out={};
  for (const i of [1,2,3]) { await btn.click({timeout:6000}); await page.waitForTimeout(2000);
    out['click'+i]=await st(); }
  await btn.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(2000);
  out.enter=await st();
  await page.keyboard.press('Space'); await page.waitForTimeout(2000); out.space=await st();
  await page.keyboard.press('Alt+ArrowDown'); await page.waitForTimeout(2000); out.altDown=await st();
  out.rolesApi = await page.evaluate(async ({ws,ch})=>{
    const tries=[`/api/v1/channels/${ch}/roles`,`/api/v1/workspaces/${ws}/roles`];
    const r=[];
    for (const u of tries){ const res=await fetch(u,{credentials:'include'});
      let j=null;try{j=await res.json()}catch{}
      const arr=(j&&(j.roles||j.items||j.data))||j;
      r.push({u:u.replace('/api/v1',''),s:res.status,
              n:Array.isArray(arr)?arr.length:(arr&&typeof arr==='object'?Object.keys(arr).length:null)});}
    return r;
  },{ws,ch});
  return out;
};
