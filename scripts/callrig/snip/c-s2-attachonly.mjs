const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/be46af86-e91b-43a7-99c1-153a85741b82/scratchpad/files';
export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(7000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  for(let i=0;i<6;i++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(200); }
  out.before=await page.evaluate(()=>document.querySelectorAll('main [data-message-id]').length);
  await page.locator('input[type=file]').first().setInputFiles(`${DIR}/qa-s2-v2.png`);
  await page.waitForTimeout(4000);
  const send=page.locator('button[aria-label="Send"]').first();
  out.sendDisabled=await send.evaluate(e=>e.disabled);
  const posts=[];
  const onReq=r=>{ if(r.url().endsWith('/api/v1/messaging/messages')&&r.method()==='POST') posts.push(JSON.parse(r.postData()||'{}')); };
  page.on('request', onReq);
  if(!out.sendDisabled) await send.click();
  await page.waitForTimeout(9000);
  page.off('request', onReq);
  out.post=posts.map(p=>({body:p.body, keys:Object.keys(p)}));
  out.after=await page.evaluate(()=>document.querySelectorAll('main [data-message-id]').length);
  const last=page.locator('main [data-message-id]').last();
  out.lastId=await last.getAttribute('data-message-id');
  out.lastShape=await last.evaluate(e=>({imgs:e.querySelectorAll('img').length,
    txt:(e.innerText||'').replace(/\s+/g,' ').slice(0,60)}));
  // pin it
  await last.scrollIntoViewIfNeeded(); await last.hover(); await page.waitForTimeout(500);
  await last.locator('button[aria-label="More actions"]').first().click({force:true});
  await page.waitForTimeout(800);
  const pin=page.locator('[role="menu"]').getByText('Pin message',{exact:true}).first();
  if(await pin.count()){ await pin.click(); await page.waitForTimeout(2800); }
  else await page.keyboard.press('Escape');
  await page.reload(); await page.waitForTimeout(7000);
  out.strip=await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect(); if(r.width<4||r.height<4) return false;
      let op=1,n=x; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        if(cs.display==='none'||cs.visibility==='hidden') return false;
        op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>=0.05;};
    return [...new Set([...document.querySelectorAll('main *')].filter(e=>e.children.length===0).filter(vis)
      .map(e=>(e.textContent||'').trim()).filter(t=>/Pinned|View all|no message text/i.test(t)&&t.length<50))];
  });
  return out;
};
