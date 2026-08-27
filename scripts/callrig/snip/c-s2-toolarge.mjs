export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const out={};
  try { await page.locator('input[type="file"]').first().setInputFiles(process.env.QA_FILE,{timeout:120000}); out.attached='ok'; }
  catch(e){ out.attached='FAIL '+String(e.message).split('\n')[0].slice(0,50); return out; }
  await page.waitForTimeout(7000);
  out.state=await page.evaluate(()=>{
    const vis=(e)=>{let op=1,n=e;
      while(n&&n!==document.documentElement){const s=getComputedStyle(n);
        op*=parseFloat(s.opacity||'1');
        if(s.display==='none'||s.visibility==='hidden') return 0; n=n.parentElement;}
      return +op.toFixed(2);};
    const msgs=[];
    for(const e of document.querySelectorAll('*')){
      if(e.children.length!==0) continue;
      const t=(e.textContent||'').trim();
      if(/too large|unsupported file type|rejected this file|is too big/i.test(t) && t.length<90)
        msgs.push({text:t.slice(0,70), opacity:vis(e)});
    }
    const send=document.querySelector('button[aria-label="Send"]');
    return {messages:msgs.slice(0,3), sendDisabled:send?!!send.disabled:null};});
  return out;
};
