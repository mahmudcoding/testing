const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/be46af86-e91b-43a7-99c1-153a85741b82/scratchpad/files';
export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={};
  const label=async()=>await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4;};
    const leaf=[...document.querySelectorAll('main *,[role="dialog"] *')]
      .filter(e=>e.children.length===0&&v(e)).map(e=>(e.textContent||'').trim());
    const toasts=[...document.querySelectorAll('[data-sonner-toast]')].filter(v)
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,50));
    return {err:[...new Set(leaf.filter(t=>/reject|failed|error|try again|too large|connection|network/i.test(t)&&t.length<60))],
            toasts:[...new Set(toasts)]};});
  const run=async (mode,file)=>{
    await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
    await page.waitForTimeout(8000);
    const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
    for(let k=0;k<6;k++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
      await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(220); }
    let hit=0;
    const h=(r)=>{ hit++; return mode==='abort' ? r.abort('failed')
      : r.fulfill({status:mode==='413'?413:500, contentType:'application/json',
          body:JSON.stringify({code:mode==='413'?413:500,key:mode==='413'?'FILE_TOO_LARGE':'FILE_STORAGE_UNAVAILABLE',
                               message:'x',trace_id:'qa'})}); };
    await page.route(u=>/\/api\/v1\/.*(upload|files)/i.test(u.toString()), h);
    await page.locator('input[type=file]').first().setInputFiles(`${DIR}/${file}`);
    await page.waitForTimeout(3500);
    await comp.click(); await page.keyboard.type('QA-UPLFAIL '+mode);
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    let last=null;
    for(let i=0;i<16;i++){ await page.waitForTimeout(900); last=await label();
      if(last.err.length) break; }
    await page.unroute(u=>/\/api\/v1\/.*(upload|files)/i.test(u.toString()), h).catch(()=>{});
    out[mode]={routeHits:hit, ...last};
  };
  await run('abort','qa-s2-v1.png');
  await run('500','qa-s2-v2.png');
  await run('413','qa-s2-v3.png');
  return out;
};
