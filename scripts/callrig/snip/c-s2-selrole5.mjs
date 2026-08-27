export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  await page.locator('button[aria-label="Channel details"]').first().click({timeout:6000});
  await page.waitForTimeout(2500);
  await page.locator('button', {hasText:/^Roles$/}).first().click({timeout:6000});
  await page.waitForTimeout(2500);
  const btn=page.locator('button[aria-label="Automatic role"]').first();
  await btn.focus(); await page.keyboard.press('Enter');
  await page.waitForTimeout(3000);
  const ui = await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const lb=[...document.querySelectorAll('[role="listbox"],[role="menu"]')].filter(v)[0];
    if(!lb) return {open:false};
    const b=lb.getBoundingClientRect();
    let op=1,n=lb; while(n&&n!==document.documentElement){const s=getComputedStyle(n);
      op*=parseFloat(s.opacity||'1'); if(s.display==='none'||s.visibility==='hidden'){op=0;break;} n=n.parentElement;}
    return {open:true, w:Math.round(b.width), h:Math.round(b.height), opacity:+op.toFixed(2),
      options:[...lb.querySelectorAll('[role="option"],[role="menuitem"]')]
        .map(o=>(o.innerText||'').replace(/\s+/g,' ').trim().slice(0,40)),
      rawText:(lb.innerText||'').replace(/\s+/g,' ').trim().slice(0,200)};
  });
  const api = await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/channels/${ch}/roles`,{credentials:'include'});
    let j=null; try{j=await r.json()}catch{}
    const arr=(j&&(j.roles||j.items||j.data))||j;
    return {status:r.status, raw:JSON.stringify(arr).slice(0,240)};
  }, ch);
  return {listbox:ui, serverRoles:api};
};
