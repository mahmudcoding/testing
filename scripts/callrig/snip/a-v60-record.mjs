const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/record/i.test(u)&&r.request().method()!=='GET'){
    let b=null;try{b=(await r.text()).slice(0,160);}catch(e){}
    net.push({m:r.request().method(),u:u.split('/api/v1/')[1]?.slice(0,50),s:r.status(),req:(r.request().postData()||'').slice(0,140),res:b});}});
  const b = page.locator('button[aria-label="Record"]').first();
  out.found = await b.count()>0;
  if(!out.found){
    out.buttons = await page.evaluate((vs)=>{const vis=eval(vs);
      return [...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||'').slice(0,24)).filter(Boolean).slice(-16);},VS);
    return out;
  }
  await b.click(); await page.waitForTimeout(3000);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/record-dialog.png'});
  out.dialog = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis).pop();
    return d?{ txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,420),
      radios:[...d.querySelectorAll('[role="radio"],input[type=radio]')].filter(vis).map(r=>({n:(r.closest('label,div')?.innerText||'').replace(/\s+/g,' ').slice(0,60),checked:r.getAttribute('aria-checked')??r.checked})),
      btns:[...d.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim().slice(0,24)).filter(Boolean) }:null;},VS);
  out.requests=net;
  return out;
};
