export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCPRIVATE0001`);
  await page.waitForTimeout(10000);
  await page.locator('button[aria-label="Channel details"]').first().click({timeout:6000});
  await page.waitForTimeout(3000);
  await page.locator('button[aria-selected]').filter({hasText:/^Members/}).first().click({timeout:6000});
  await page.waitForTimeout(4000);
  const out={};
  // other member's Remove button behaves the same?
  await page.locator('button[aria-label="Remove QA Owner"]').first().click({timeout:6000});
  await page.waitForTimeout(3000);
  out.afterRemoveOwner=await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/channels/C4QCPRIVATE0001/members',{credentials:'include'});
    const j=await r.json(); const a=(j&&(j.members||j))||[];
    const v=(e)=>{const b=e.getBoundingClientRect();return b.width>3&&b.height>3;};
    return {members:Array.isArray(a)?a.length:null,
      dialogs:[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(v).length};});
  // profile card path
  await page.locator("button[aria-label=\"Open QA Bob's profile\"]").first().click({timeout:6000});
  await page.waitForTimeout(4000);
  out.profileCard=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"],aside')].filter(v)
      .sort((a,b)=>(b.innerText||'').length-(a.innerText||'').length)[0];
    if(!d) return 'NO-CARD';
    return {text:(d.innerText||'').replace(/\s+/g,' ').trim().slice(0,150),
      buttons:[...new Set([...d.querySelectorAll('button')].filter(v)
        .map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,26)))].slice(0,12)};});
  return out;
};
