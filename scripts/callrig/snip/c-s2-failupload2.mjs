const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/be46af86-e91b-43a7-99c1-153a85741b82/scratchpad/files';
export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={};
  const run=async(mode, file, tag)=>{
    await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
    await page.waitForTimeout(7000);
    const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
    for(let i=0;i<6;i++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
      await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(200); }
    await page.locator('input[type=file]').first().setInputFiles(`${DIR}/${file}`);
    await page.waitForTimeout(3000);
    let hit=0;
    await page.route('**/files/upload**', r=>{ hit++;
      return mode==='abort' ? r.abort('failed')
        : r.fulfill({status:500, contentType:'application/json',
            body:JSON.stringify({code:500,key:"FILE_STORAGE_UNAVAILABLE",
              message:"storage backend unavailable",trace_id:"qa-trace"})}); });
    await comp.click(); await comp.type(tag, {delay:30}); await page.waitForTimeout(300);
    await page.keyboard.press('Enter');
    const s=[];
    for(let i=0;i<14;i++){ await page.waitForTimeout(500);
      s.push(await page.evaluate(()=>{
        const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
        return {notices:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis)
            .map(x=>x.textContent.trim().slice(0,64)),
          errText:[...document.querySelectorAll('body *')].filter(e=>e.children.length===0)
            .filter(e=>!['SCRIPT','STYLE'].includes(e.tagName)).filter(vis)
            .map(e=>(e.textContent||'').trim())
            .filter(t=>/reject|fail|error|try again|could not|storage|unavailable/i.test(t)&&t.length<80)};}));
    }
    await page.unroute('**/files/upload**');
    return {tag, mode, hit, notices:[...new Set(s.flatMap(x=>x.notices))],
      errText:[...new Set(s.flatMap(x=>x.errText))]};
  };
  out.abort  = await run('abort','qa-s2-v1.png','QA-S2-UPFAIL-ABORT');
  out.err500 = await run('500','qa-s2-v2.png','QA-S2-UPFAIL-500');
  return out;
};
