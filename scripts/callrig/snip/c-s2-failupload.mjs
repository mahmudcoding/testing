const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/be46af86-e91b-43a7-99c1-153a85741b82/scratchpad/files';
export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(7000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  for(let i=0;i<6;i++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(200); }
  // 1. transport failure
  let aborted=0;
  await page.route('**/upload**', r=>{ aborted++; return r.abort('failed'); });
  await page.locator('input[type=file]').first().setInputFiles(`${DIR}/qa-s2-v1.png`);
  const s=[];
  for(let i=0;i<12;i++){ await page.waitForTimeout(500);
    s.push(await page.evaluate(()=>{
      const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
      return {notices:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis)
          .map(x=>x.textContent.trim().slice(0,60)),
        anyErrText:[...document.querySelectorAll('body *')].filter(e=>e.children.length===0)
          .filter(e=>!['SCRIPT','STYLE'].includes(e.tagName)).filter(vis)
          .map(e=>(e.textContent||'').trim())
          .filter(t=>/reject|fail|error|try again|could not/i.test(t)&&t.length<70)};}));
  }
  await page.unroute('**/upload**');
  out.transport={aborted, notices:[...new Set(s.flatMap(x=>x.notices))],
    errText:[...new Set(s.flatMap(x=>x.anyErrText))]};
  // 2. server-side rejection: 500
  await page.reload(); await page.waitForTimeout(6500);
  let served=0;
  await page.route('**/upload**', r=>{ served++; return r.fulfill({status:500,
    contentType:'application/json',
    body:JSON.stringify({code:500,key:"FILE_STORAGE_UNAVAILABLE",message:"storage backend unavailable",trace_id:"qa"})}); });
  await page.locator('input[type=file]').first().setInputFiles(`${DIR}/qa-s2-v2.png`);
  const s2=[];
  for(let i=0;i<12;i++){ await page.waitForTimeout(500);
    s2.push(await page.evaluate(()=>{
      const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
      return {notices:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis)
          .map(x=>x.textContent.trim().slice(0,60)),
        anyErrText:[...document.querySelectorAll('body *')].filter(e=>e.children.length===0)
          .filter(e=>!['SCRIPT','STYLE'].includes(e.tagName)).filter(vis)
          .map(e=>(e.textContent||'').trim())
          .filter(t=>/reject|fail|error|try again|could not|storage/i.test(t)&&t.length<70)};}));
  }
  await page.unroute('**/upload**');
  out.server500={served, notices:[...new Set(s2.flatMap(x=>x.notices))],
    errText:[...new Set(s2.flatMap(x=>x.anyErrText))]};
  return out;
};
