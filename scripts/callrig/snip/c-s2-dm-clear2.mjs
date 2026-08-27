const DM='C4OVEWOTJW1AA86';
export default async ({page}) => {
  const out={}; const resp=[];
  page.on('response', r=>{ if(/\/api\/v1\//.test(r.url()) && r.request().method()!=='GET') resp.push({s:r.status(), m:r.request().method(), u:r.url().split('/api/v1')[1].slice(0,56)}); });
  await page.locator('[role="menu"] button, [data-radix-popper-content-wrapper] button').filter({hasText:/^Clear conversation history$/}).last().click({timeout:8000});
  await page.waitForTimeout(2000);
  out.dialog = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    return d? {text:d.innerText.replace(/\n+/g,' | ').slice(0,420),
      buttons:[...d.querySelectorAll('button')].filter(vis).map(b=>({l:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,26), d:b.disabled}))}:null;
  });
  await page.locator('[role="dialog"] button:visible').filter({hasText:/^Clear history$/}).last().click({timeout:8000});
  await page.waitForTimeout(4000);
  out.resp = resp;
  out.after = await page.evaluate(async (dm)=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const r=await fetch(`/api/v1/messaging/channels/${dm}/messages?limit=20`,{credentials:'include'});
    let j=null; try{j=await r.json();}catch(e){}
    const list=(j&&(j.messages||j.data))||[];
    const main=document.querySelector('main')||document.body;
    return {apiCount:list.length, apiBodies:list.map(m=>m.body).slice(0,6),
      domCount: document.querySelectorAll('[data-message-id]').length,
      mainText: main.innerText.replace(/\n+/g,' | ').slice(0,180),
      toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis).map(e=>(e.textContent||'').trim()).filter(Boolean).slice(0,3),
      url:location.href};
  }, DM);
  return out;
};
