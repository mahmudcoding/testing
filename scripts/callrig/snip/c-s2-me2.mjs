export default async ({page}) => {
  const out={};
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  const snap=()=>page.evaluate(()=>{
    const c=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
    const opts=[...document.querySelectorAll('[role="option"]')].filter(e=>e.getBoundingClientRect().height>0);
    const send=document.querySelector('button[aria-label="Send"]');
    return {comp:c?c.innerText:null, opts:opts.length,
      optTxt:opts.map(o=>(o.innerText||'').replace(/\s+/g,' ').slice(0,26)),
      sendDisabled: send? send.disabled : 'no send btn',
      notices:[...document.querySelectorAll('[role="status"],[role="alert"]')]
        .filter(e=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4;})
        .map(e=>e.textContent.trim().slice(0,60))};
  });
  out.now = await snap();
  // clean start
  await comp.click(); await page.keyboard.press('Control+A'); await page.keyboard.press('Backspace');
  await page.waitForTimeout(400);
  await comp.type('/me machet QA-S2-ME2', {delay:45});
  await page.waitForTimeout(1400);
  out.beforeEnter = await snap();
  const posts=[];
  const onReq=r=>{ if(r.url().endsWith('/api/v1/messaging/messages')&&r.method()==='POST') posts.push(JSON.parse(r.postData()||'{}').body); };
  page.on('request', onReq);
  await page.keyboard.press('Enter');
  const after=[];
  for(let i=0;i<8;i++){ await page.waitForTimeout(400); after.push(await snap()); }
  page.off('request', onReq);
  out.posts=posts;
  out.afterEnterFirst=after[0]; out.afterEnterLast=after.at(-1);
  out.lastMsgs = await page.evaluate(()=>[...document.querySelectorAll('main [data-message-id]')].slice(-2)
    .map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,60)));
  return out;
};
