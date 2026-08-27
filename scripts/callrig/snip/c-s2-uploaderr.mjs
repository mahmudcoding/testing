const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/be46af86-e91b-43a7-99c1-153a85741b82/scratchpad/files';
export default async ({page, ctx}) => {
  try { return await run({page,ctx}); }
  finally { try{ await page.unroute('**/files/upload'); }catch(e){} await ctx.setOffline(false); }
};
const run = async ({page, ctx}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const out={cases:[]};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(10000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  const empty=async()=>{for(let i=0;i<8;i++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') return true;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(220);} return false;};
  const chipText=()=>page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const hits=[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&v(e))
      .map(e=>(e.textContent||'').trim())
      .filter(t=>/rejected|reach the server|unexpected response|Upload canceled|too large|unsupported|not allowed|no longer exists|Network|Could not/i.test(t));
    return [...new Set(hits)].slice(0,4);});
  const attempt=async(label, setup)=>{
    await empty();
    await setup();
    await page.locator('input[type=file]').first().setInputFiles(`${DIR}/qa-s2-m3.txt`);
    await page.waitForTimeout(3000);
    await comp.click(); await comp.type('QA-UPERR-'+label,{delay:30}); await page.waitForTimeout(400);
    await page.keyboard.press('Enter');
    const seen=[];
    for(let i=0;i<10;i++){ await page.waitForTimeout(800); for(const t of await chipText()) if(!seen.includes(t)) seen.push(t); }
    try{ await page.unroute('**/files/upload'); }catch(e){}
    out.cases.push({label, messages:seen});
  };
  await attempt('abort-failed', async()=>{
    await page.route('**/files/upload', r=>r.abort('failed')); });
  await attempt('abort-internetdisconnected', async()=>{
    await page.route('**/files/upload', r=>r.abort('internetdisconnected')); });
  await attempt('status-500', async()=>{
    await page.route('**/files/upload', r=>r.fulfill({status:500, contentType:'application/json',
      body:JSON.stringify({error:{code:'FILE_STORAGE_UNAVAILABLE'}})})); });
  await attempt('status-413', async()=>{
    await page.route('**/files/upload', r=>r.fulfill({status:413, contentType:'application/json',
      body:JSON.stringify({error:{code:'FILE_TOO_LARGE'}})})); });
  await empty();
  return out;
};
