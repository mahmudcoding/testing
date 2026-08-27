const WS='W4QCF1XTURESO01', CH='C4OWKQTPC7FZ35V';
export default async ({page}) => {
  const out={};
  const reqs=[];
  page.on('request', r=>{ if(/\/api\/v1\//.test(r.url()) && r.method()!=='GET') reqs.push({m:r.method(), u:r.url().split('/api/v1')[1].slice(0,60), post:(r.postData()||'').slice(0,120)}); });
  const resp=[];
  page.on('response', r=>{ if(/\/api\/v1\//.test(r.url()) && r.request().method()!=='GET') resp.push({s:r.status(), u:r.url().split('/api/v1')[1].slice(0,60)}); });
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`,{waitUntil:'load'});
  await page.waitForTimeout(5500);
  out.chanObject = await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/channels/${ch}`,{credentials:'include'});
    return {status:r.status, body:(await r.text()).slice(0,400)};
  }, CH);
  await page.locator('button[aria-label="Channel details"]').last().click({timeout:8000});
  await page.waitForTimeout(2200);
  const btn = page.locator('button:visible').filter({hasText:/^Archive channel$/}).last();
  out.btnBefore = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].filter(x=>/^Archive channel$/.test((x.textContent||'').trim())).pop();
    if(!b) return null; const r=b.getBoundingClientRect();
    const c=document.elementFromPoint(Math.round(r.x+r.width/2), Math.round(r.y+r.height/2));
    return {disabled:b.disabled, rect:{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)},
      hit: c? (b===c||b.contains(c)) : false, pe:getComputedStyle(b).pointerEvents};
  });
  await btn.click({timeout:8000});
  // poll right after the click
  const frames=[];
  for (let i=0;i<14;i++){
    await page.waitForTimeout(300);
    frames.push(await page.evaluate(()=>{
      const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
      const ds=[...document.querySelectorAll('[role="dialog"]')].filter(vis).map(d=>d.innerText.replace(/\n+/g,' | ').slice(0,120));
      const pops=[...document.querySelectorAll('[data-radix-popper-content-wrapper]')].filter(vis).map(p=>p.innerText.replace(/\n+/g,' | ').slice(0,100));
      const toasts=[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis).map(e=>(e.textContent||'').trim()).filter(Boolean).slice(0,3);
      return {ds, pops, toasts, url:location.href};
    }));
  }
  out.frames = frames.filter((f,i)=> i===0 || JSON.stringify(f)!==JSON.stringify(frames[i-1]));
  out.reqs = reqs; out.resp = resp;
  out.after = await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/channels/${ch}`,{credentials:'include'});
    return {body:(await r.text()).slice(0,300)};
  }, CH);
  return out;
};
