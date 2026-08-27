export default async ({page}) => {
  const id='M4OXFPK7R352QL5';
  const out={};
  const msg=page.locator(`[data-message-id="${id}"]`).first();
  await msg.scrollIntoViewIfNeeded().catch(()=>{});
  await msg.hover(); await page.waitForTimeout(1500);
  await msg.locator('button[aria-label="More actions"]').first().click({timeout:6000});
  await page.waitForTimeout(2500);
  out.menu=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const m=[...document.querySelectorAll('[role="menu"]')].filter(v)[0];
    return m?[...m.querySelectorAll('[role="menuitem"],button')].filter(v)
      .map(b=>(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,22)).filter(Boolean):'NO-MENU';});
  await page.locator('[role="menu"] [role="menuitem"], [role="menu"] button')
    .filter({hasText:/^Pin message$/}).first().click({timeout:6000}).catch(()=>{out.pinFail=true});
  await page.waitForTimeout(3000);
  out.confirm=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(v)[0];
    return d?{text:(d.innerText||'').replace(/\s+/g,' ').trim().slice(0,170),
      buttons:[...d.querySelectorAll('button')].filter(v)
        .map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,20))}:'no dialog';});
  // if a dialog, confirm it
  const ok=page.locator('[role="dialog"] button, [role="alertdialog"] button').filter({hasText:/^(Pin|Pin message|Confirm)$/}).first();
  if(await ok.count()) await ok.click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(6000);
  out.banner=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const b=[...document.querySelectorAll('button')].filter(v)
      .find(x=>/pin/i.test(x.getAttribute('aria-label')||''));
    if(!b) return 'no banner';
    let n=b; for(let i=0;i<3&&n.parentElement;i++) n=n.parentElement;
    let op=1,m=b;
    while(m&&m!==document.documentElement){const s=getComputedStyle(m);
      op*=parseFloat(s.opacity||'1'); if(s.display==='none'||s.visibility==='hidden'){op=0;break;} m=m.parentElement;}
    return {text:(n.innerText||'').replace(/\s+/g,' ').trim().slice(0,110), opacityProduct:+op.toFixed(2),
      imgsInBanner:n.querySelectorAll('img').length};});
  return out;
};
