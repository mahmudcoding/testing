const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/be46af86-e91b-43a7-99c1-153a85741b82/scratchpad/files';
const empty = async (page, comp) => {
  for (let i=0;i<8;i++){
    if ((await comp.evaluate(e=>e.innerText.trim()))==='') return true;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);
  }
  return false;
};
export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(7000);
  // unpin whatever is pinned
  const unpinAll=async()=>{
    const va=page.locator('button').filter({hasText:/View all/}).first();
    if(!await va.count()) return 'no strip';
    await va.click(); await page.waitForTimeout(2000);
    const res=[];
    for(let i=0;i<5;i++){
      const up=page.locator('button[aria-label="Unpin message"], button[aria-label="Unpin"]').first();
      if(!await up.count()) break;
      await up.click(); await page.waitForTimeout(1500); res.push('unpinned');
    }
    await page.keyboard.press('Escape'); await page.waitForTimeout(800);
    return res;
  };
  out.cleared=await unpinAll();
  // send an attachment-only message
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  await empty(page, comp);
  await page.locator('input[type=file]').first().setInputFiles(`${DIR}/qa-s2-v1.png`);
  await page.waitForTimeout(3500);
  await page.keyboard.press('Enter'); await page.waitForTimeout(8000);
  const last=page.locator('main [data-message-id]').last();
  out.lastId=await last.getAttribute('data-message-id');
  out.lastShape=await last.evaluate(e=>({imgs:e.querySelectorAll('img').length,
    txt:(e.innerText||'').replace(/\s+/g,' ').slice(0,60)}));
  await last.scrollIntoViewIfNeeded(); await last.hover(); await page.waitForTimeout(500);
  await last.locator('button[aria-label="More actions"]').first().click({force:true});
  await page.waitForTimeout(800);
  const pin=page.locator('[role="menu"]').getByText('Pin message',{exact:true}).first();
  out.pinOffered=await pin.count();
  if(out.pinOffered){ await pin.click(); await page.waitForTimeout(2800); }
  else await page.keyboard.press('Escape');
  await page.reload(); await page.waitForTimeout(7000);
  out.strip=await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect(); if(r.width<4||r.height<4) return false;
      let op=1,n=x; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        if(cs.display==='none'||cs.visibility==='hidden') return false;
        op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>=0.05;};
    const hits=[...document.querySelectorAll('main *')].filter(e=>e.children.length===0).filter(vis)
      .map(e=>(e.textContent||'').trim()).filter(t=>/Pinned|View all|no message text/i.test(t)&&t.length<50);
    return [...new Set(hits)];
  });
  return out;
};
