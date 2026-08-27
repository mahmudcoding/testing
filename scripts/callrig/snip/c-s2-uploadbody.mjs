const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/be46af86-e91b-43a7-99c1-153a85741b82/scratchpad/files';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(7000);
  const caught=[];
  await page.route('**/api/v1/**/upload*', async (route) => {
    const req=route.request();
    let txt=null;
    try { const b=req.postDataBuffer(); txt = b? b.toString('latin1'):null; } catch(e){ txt='ERR:'+String(e).slice(0,50); }
    caught.push({url:req.url().split('/api/v1')[1].slice(0,50), len: txt? txt.length:0,
      hasDisplayMode: txt? /name="display_mode"/.test(txt):null,
      displayValue: txt? ((txt.match(/name="display_mode"\r?\n\r?\n([^\r\n]*)/)||[])[1] ?? null) : null});
    await route.continue();
  });
  const out={};
  const run = async (asFile) => {
    caught.length=0;
    await page.locator('input[type=file]').first().setInputFiles(`${DIR}/qa-s2-pic.png`);
    await page.waitForTimeout(5000);
    if (asFile) { await page.locator('button[aria-label="Send as file"]').first().click({timeout:8000}); await page.waitForTimeout(1500); }
    const label = await page.evaluate(()=>{
      const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
      return [...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||'').trim()).filter(t=>/send as/i.test(t))[0]||null;
    });
    await page.locator('button[aria-label="Send"]').last().click({timeout:8000});
    await page.waitForTimeout(6000);
    return {toggleLabel:label, uploads:caught.slice()};
  };
  out.photoMode = await run(false);
  out.fileMode  = await run(true);
  await page.unroute('**/api/v1/**/upload*');
  return out;
};
