const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/be46af86-e91b-43a7-99c1-153a85741b82/scratchpad/files';
export default async ({page, ctx}) => {
  try { return await run({page,ctx}); } finally { await ctx.setOffline(false); try{ await page.unroute('**/files/upload'); }catch(e){} }
};
const run = async ({page, ctx}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={};
  const snap=()=>page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect(); if(r.width<3||r.height<3) return false;
      let o=1,n=e; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden') return false; n=n.parentElement;}
      return o>0.05;};
    const toasts=[...new Set([...document.querySelectorAll('[data-sonner-toast],[role="alert"]')].filter(v)
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,60)))];
    const page_=[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&v(e))
      .map(e=>(e.textContent||'').trim())
      .filter(t=>/rejected|Network error|Waiting for network|Could not send|Try again/i.test(t));
    return {toasts, inlineMessages:[...new Set(page_)].slice(0,5)};});
  const attemptSend=async(tag)=>{
    const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
    for(let i=0;i<6;i++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
      await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(200); }
    await page.locator('input[type=file]').first().setInputFiles(`${DIR}/qa-s2-m3.txt`);
    await page.waitForTimeout(3000);
    await comp.click(); await comp.type(tag,{delay:35}); await page.waitForTimeout(400);
    await page.keyboard.press('Enter');
    const series=[];
    for(let i=0;i<12;i++){ await page.waitForTimeout(600); series.push(await snap()); }
    return {toasts:[...new Set(series.flatMap(s=>s.toasts))],
      inline:[...new Set(series.flatMap(s=>s.inlineMessages))]};
  };
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  // A: genuine offline — the browser knows it is offline
  await ctx.setOffline(true); await page.waitForTimeout(1200);
  out.A_setOffline=await attemptSend('QA-S2-BRK-A');
  await ctx.setOffline(false); await page.waitForTimeout(12000);
  // B: the browser believes it is online, but the upload request fails
  await page.reload(); await page.waitForTimeout(9000);
  await page.route('**/files/upload', r=>r.abort('failed'));
  out.B_routeAbort=await attemptSend('QA-S2-BRK-B');
  await page.unroute('**/files/upload');
  return out;
};
