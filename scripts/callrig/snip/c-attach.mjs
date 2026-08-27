export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const SP=process.env.SP;
  const V=`(e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;})`;
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, {waitUntil:'load'});
  await page.waitForTimeout(4000);
  const inputs = await page.evaluate(()=>[...document.querySelectorAll('input[type=file]')].map(i=>({acc:i.accept,mult:i.multiple})));
  let set='none';
  const fi = page.locator('input[type=file]').first();
  if(await fi.count()){ try{ await fi.setInputFiles([SP+'/qa-c-attach.png']); set='setInputFiles ok'; }catch(e){ set='failed: '+e.message.slice(0,80); } }
  await page.waitForTimeout(3000);
  const staged = await page.evaluate(v=>{const vv=eval(v);
    const b=document.body.innerText;
    return {mentionsFile:/qa-c-attach/i.test(b),
      previewImgs:[...document.querySelectorAll('img')].filter(vv).filter(i=>/blob:|data:/.test(i.src)).length,
      composerArea:(document.querySelector('div[contenteditable="true"][aria-label="Compose message"]')||{}).parentElement?.parentElement?.innerText?.replace(/\s+/g,' ').slice(0,150)};}, V);
  return {fileInputs: inputs, setResult: set, staged};
};
