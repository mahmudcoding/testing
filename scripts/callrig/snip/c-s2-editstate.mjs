export default async ({page}) => {
  const out={};
  const snap=()=>page.evaluate(()=>{
    const c=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>6&&r.height>6;};
    const send=document.querySelector('button[aria-label="Send"]');
    return {composer:c?c.innerText.slice(0,60):null,
      notices:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis)
        .map(x=>x.textContent.trim().slice(0,44)),
      sendLabel: send? send.getAttribute('aria-label'):null,
      sendDisabled: send? send.disabled:null,
      allBtnsBottom:[...document.querySelectorAll('button')].filter(vis)
        .filter(b=>b.getBoundingClientRect().y>window.innerHeight-220)
        .map(b=>b.getAttribute('aria-label')||(b.textContent||'').trim().slice(0,16))};
  });
  out.now=await snap();
  const reqs=[];
  const onReq=r=>{ if(r.url().includes('/api/v1/messaging/')&&r.method()!=='GET')
    reqs.push({m:r.method(), u:r.url().split('/api/v1')[1].slice(0,58), body:(r.postData()||'').slice(0,80)}); };
  page.on('request', onReq);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  await comp.click(); await page.waitForTimeout(300);
  await page.keyboard.press('Enter'); await page.waitForTimeout(2500);
  page.off('request', onReq);
  out.enterReqs=reqs;
  out.afterEnter=await snap();
  return out;
};
