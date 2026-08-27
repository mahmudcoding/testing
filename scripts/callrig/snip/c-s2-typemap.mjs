export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const files=(process.env.QA_FILES||'').split(',').filter(Boolean);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const out={};
  out.acceptAttr=await page.evaluate(()=>{
    const i=document.querySelector('input[type="file"]');
    return i?(i.getAttribute('accept')||'(none)'):'no input';});
  const results=[];
  for (const f of files){
    await page.reload(); await page.waitForTimeout(9000);
    await page.locator('input[type="file"]').first().setInputFiles(f).catch(()=>{});
    await page.waitForTimeout(4500);
    const r=await page.evaluate(()=>{
      const vis=(e)=>{let op=1,n=e;
        while(n&&n!==document.documentElement){const s=getComputedStyle(n);
          op*=parseFloat(s.opacity||'1');
          if(s.display==='none'||s.visibility==='hidden') return 0; n=n.parentElement;}
        return +op.toFixed(2);};
      let node=null;
      for(const e of document.querySelectorAll('*'))
        if(e.children.length===0 && /unsupported file type/i.test(e.textContent||'')){ node=e; break; }
      const send=document.querySelector('button[aria-label="Send"]');
      return {rejected:!!node && vis(node)>0,
        sendDisabled:send?!!(send.disabled):null};});
    results.push({file:f.split('/').pop(), ...r});
  }
  out.results=results;
  return out;
};
