export default async ({page}) => {
  const out={posts:[], poll:[]};
  const onReq=r=>{ if(r.url().endsWith('/api/v1/messaging/messages')&&r.method()==='POST')
    out.posts.push((r.postData()||'').slice(0,180)); };
  page.on('request', onReq);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  await comp.click(); await page.keyboard.press('Control+A'); await page.keyboard.press('Backspace');
  await page.waitForTimeout(400);
  await comp.type('/shrug', {delay:70});
  for(let i=0;i<14;i++){ await page.waitForTimeout(220);
    out.poll.push(await page.evaluate(()=>{
      const opts=[...document.querySelectorAll('[role="option"]')].filter(e=>e.getBoundingClientRect().height>0);
      const wrap=document.querySelector('[data-radix-popper-content-wrapper]');
      return {n:opts.length, txt:opts.map(o=>(o.innerText||'').replace(/\s+/g,' ').slice(0,26)),
        wrap: wrap? (wrap.innerText||'').replace(/\s+/g,' ').slice(0,60):null,
        comp:(document.querySelector('div[contenteditable="true"][aria-label="Compose message"]')||{}).innerText};
    }));
  }
  const seen=out.poll.filter(p=>p.n>0);
  out.pickerSeen=seen.length;
  out.firstSeen=seen[0]||null;
  if (seen.length){
    // click the option rather than pressing Enter
    await page.locator('[role="option"]').first().click();
    await page.waitForTimeout(1200);
  }
  out.composerAfter = await comp.evaluate(e=>e.innerText.slice(0,70));
  page.off('request', onReq);
  return out;
};
