const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/be46af86-e91b-43a7-99c1-153a85741b82/scratchpad/files';
export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={reqs:[]};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(8000);
  page.on('request', r=>{ const u=r.url();
    if(/\/api\/v1\//.test(u)&&r.method()!=='GET') out.reqs.push(r.method()+' '+u.replace(/^https?:\/\/[^/]+/,'').slice(0,80)); });
  const inputs=await page.locator('input[type=file]').count();
  out.fileInputs=inputs;
  if(inputs){
    await page.locator('input[type=file]').first().setInputFiles(`${DIR}/qa-s2-v1.png`).catch(e=>{out.setErr=String(e).slice(0,80)});
  }
  await page.waitForTimeout(6000);
  // proof the attachment landed in the composer
  out.chip=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4;};
    const hits=[...document.querySelectorAll('main *')].filter(e=>e.children.length===0&&v(e))
      .map(e=>(e.textContent||'').trim()).filter(t=>/qa-s2-v1|\.png/i.test(t));
    return [...new Set(hits)].slice(0,4);});
  return out;
};
