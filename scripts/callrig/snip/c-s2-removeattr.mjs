export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCPRIVATE0001`);
  await page.waitForTimeout(10000);
  await page.locator('button[aria-label="Channel details"]').first().click({timeout:6000});
  await page.waitForTimeout(3000);
  await page.locator('button[aria-selected]').filter({hasText:/^Members/}).first().click({timeout:6000});
  await page.waitForTimeout(4000);
  const attrs=await page.evaluate(()=>{
    const b=document.querySelector('button[aria-label="Remove QA Bob"]');
    if(!b) return null;
    const o={}; for(const a of b.attributes) o[a.name]=a.value.slice(0,40);
    const r=b.getBoundingClientRect();
    let op=1,n=b; while(n&&n!==document.documentElement){const s=getComputedStyle(n);
      op*=parseFloat(s.opacity||'1'); if(s.display==='none'||s.visibility==='hidden'){op=0;break;} n=n.parentElement;}
    const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
    return {attrs:o, disabled:b.disabled, tag:b.tagName,
      rect:{w:Math.round(r.width),h:Math.round(r.height),y:Math.round(r.top)},
      opacityProduct:+op.toFixed(2), hitIsSelfOrChild:!!hit&&(b.contains(hit)||hit.contains(b)),
      pointerEvents:getComputedStyle(b).pointerEvents};
  });
  const st=()=>page.evaluate(async ()=>{
    const r=await fetch('/api/v1/channels/C4QCPRIVATE0001/members',{credentials:'include'});
    const j=await r.json(); const a=(j&&(j.members||j))||[];
    const v=(e)=>{const b=e.getBoundingClientRect();return b.width>3&&b.height>3;};
    return {members:Array.isArray(a)?a.length:null,
      dialogs:[...document.querySelectorAll('[role="dialog"],[role="alertdialog"],[role="menu"]')].filter(v).length};});
  const btn=page.locator('button[aria-label="Remove QA Bob"]').first();
  const out={attrs};
  await btn.click({timeout:6000}); await page.waitForTimeout(2500); out.afterClick1=await st();
  await btn.click({timeout:6000}); await page.waitForTimeout(2500); out.afterClick2=await st();
  await btn.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(2500); out.afterEnter=await st();
  return out;
};
