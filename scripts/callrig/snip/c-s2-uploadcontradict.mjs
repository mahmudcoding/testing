const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/be46af86-e91b-43a7-99c1-153a85741b82/scratchpad/files';
export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={};
  const run=async(file, tag)=>{
    await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
    await page.waitForTimeout(7000);
    const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
    for(let i=0;i<6;i++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
      await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(200); }
    await page.locator('input[type=file]').first().setInputFiles(`${DIR}/${file}`);
    await page.waitForTimeout(3000);
    let hit=0;
    await page.route('**/files/upload**', r=>{ hit++; return r.abort('failed'); });
    await comp.click(); await comp.type(tag, {delay:30}); await page.waitForTimeout(300);
    await page.keyboard.press('Enter');
    const s=[];
    for(let i=0;i<16;i++){ await page.waitForTimeout(400);
      s.push(await page.evaluate(()=>{
        const vis=(x)=>{const r=x.getBoundingClientRect(); if(r.width<4||r.height<4) return false;
          let op=1,n=x; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
            if(cs.display==='none'||cs.visibility==='hidden') return false;
            op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>=0.05;};
        const texts=[...document.querySelectorAll('body *')].filter(e=>e.children.length===0)
          .filter(e=>!['SCRIPT','STYLE'].includes(e.tagName)).filter(vis)
          .map(e=>(e.textContent||'').trim());
        return {rejected: texts.some(t=>/server rejected this file/i.test(t)),
          network: texts.some(t=>/Network error/i.test(t)),
          both: texts.some(t=>/server rejected this file/i.test(t)) && texts.some(t=>/Network error/i.test(t))};}));
    }
    await page.unroute('**/files/upload**');
    return {tag, hit, everBoth:s.some(x=>x.both),
      bothSamples:s.filter(x=>x.both).length, total:s.length,
      rejectedSamples:s.filter(x=>x.rejected).length, networkSamples:s.filter(x=>x.network).length};
  };
  out.run1=await run('qa-s2-v1.png','QA-S2-UPCONTRA1');
  out.run2=await run('qa-s2-v2.png','QA-S2-UPCONTRA2');
  return out;
};
