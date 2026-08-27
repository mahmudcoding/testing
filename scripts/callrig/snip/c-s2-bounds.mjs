export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  const clear=async()=>{for(let k=0;k<6;k++){
    if((await comp.evaluate(e=>e.innerText.trim()))==='') return;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(230);}};
  const send=async(label, typer)=>{
    await clear(); await comp.click();
    const reqs=[]; const h=r=>{ const u=r.url();
      if(/\/api\/v1\/messaging\/messages/.test(u)&&r.method()==='POST') reqs.push(1); };
    page.on('request',h);
    await typer();
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3500);
    page.off('request',h);
    const st=await page.evaluate(()=>({comp:(document.querySelector('div[contenteditable="true"][aria-label="Compose message"]')?.innerText||'').slice(0,40)}));
    out[label]={posted:reqs.length, composerAfter:st.comp};
  };
  // 1. whitespace only
  await send('whitespaceOnly', async()=>{ await page.keyboard.type('     '); });
  // 2. newlines only (shift+enter)
  await send('newlinesOnly', async()=>{ for(let i=0;i<3;i++){ await page.keyboard.press('Shift+Enter'); } });
  // 3. very long single word (no spaces)
  await send('longWord', async()=>{ await comp.evaluate(()=>{}); await page.keyboard.insertText('QA-BOUND-'+'x'.repeat(4000)); });
  await page.waitForTimeout(2500);
  out.longWordOverflow=await page.evaluate(()=>{
    const els=[...document.querySelectorAll('main [data-message-id]')]
      .filter(e=>/QA-BOUND-x/.test(e.innerText||''));
    const m=els[els.length-1]; if(!m) return {found:false};
    const leaves=[...m.querySelectorAll('*')].filter(e=>e.children.length===0);
    const bad=leaves.filter(e=>e.scrollWidth>e.clientWidth+1)
      .map(e=>({sw:e.scrollWidth, cw:e.clientWidth}));
    return {found:true, clipped:bad.slice(0,3),
      msgWidth:Math.round(m.getBoundingClientRect().width),
      pageOverflow: document.documentElement.scrollWidth>window.innerWidth};});
  return out;
};
