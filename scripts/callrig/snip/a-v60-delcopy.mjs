const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/roles?scope=company',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const del = await page.evaluate((vs)=>{const vis=eval(vs);
    const rows=[...document.querySelectorAll('tr')].filter(vis).filter(r=>/R4QA/.test(r.innerText||''));
    const r=rows[rows.length-1];
    const b=r?[...r.querySelectorAll('button')].filter(vis).find(b=>/^Delete$/.test((b.innerText||'').trim())):null;
    if(!b) return null; const g=b.getBoundingClientRect();
    return {row:(r.innerText||'').replace(/\s+/g,' ').slice(0,40), x:Math.round(g.x+g.width/2), y:Math.round(g.y+g.height/2)};},VS);
  out.target=del;
  if(!del) return out;
  await page.mouse.click(del.x,del.y);
  await page.waitForTimeout(2500);
  out.dialog = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis).pop();
    if(!d) return {none:true};
    // every visible leaf line, in order — is the description repeated?
    const leaves=[...d.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&(e.innerText||'').trim())
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim());
    const counts={}; leaves.forEach(l=>counts[l]=(counts[l]||0)+1);
    return { leaves, duplicated:Object.entries(counts).filter(([k,v])=>v>1),
      fullText:(d.innerText||'').replace(/\s+/g,' ').slice(0,200) };},VS);
  // cancel — do not actually delete a fixture role
  await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis).pop();
    [...(d?.querySelectorAll('button')||[])].filter(vis).find(b=>/^Cancel$/i.test((b.innerText||'').trim()))?.click();},VS);
  await page.waitForTimeout(1500);
  out.cancelled = await page.evaluate((vs)=>{const vis=eval(vs);
    return [...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis).length===0;},VS);
  return out;
};
