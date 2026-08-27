const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const reqs=[];
  page.on('response', async r=>{const u=r.url(); if(/\/api\/v1\/calendar/.test(u)&&r.request().method()!=='GET'){
    let b=null;try{b=(await r.text()).slice(0,260);}catch(e){}
    reqs.push({m:r.request().method(),u:u.split('/api/v1/')[1].slice(0,40),s:r.status(),req:(r.request().postData()||'').slice(0,260),res:b});}});
  const title='V60 Organizer Check '+Math.floor(Date.now()/1000%100000);
  // set a valid title
  await page.evaluate(([vs,val])=>{const vis=eval(vs);const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis)[0];
    const i=[...d.querySelectorAll('input')].filter(vis)[0];
    const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
    s.call(i,val); i.dispatchEvent(new Event('input',{bubbles:true}));},[VS,title]);
  await page.waitForTimeout(800);
  // add bob as a participant via Search members
  const sm = await page.$('[role="dialog"] input[placeholder="Search members"]');
  if(sm){ await sm.click(); await page.keyboard.type('Bob',{delay:70}); await page.waitForTimeout(1800);
    out.suggestions = await page.evaluate((vs)=>{const vis=eval(vs);
      return [...document.querySelectorAll('[role="option"],[role="dialog"] li,[role="dialog"] button')].filter(vis)
        .map(b=>(b.innerText||'').trim().replace(/\s+/g,' ').slice(0,26)).filter(t=>/bob/i.test(t)).slice(0,4);},VS);
    const picked = await page.evaluate((vs)=>{const vis=eval(vs);
      const c=[...document.querySelectorAll('[role="option"],[role="dialog"] li,[role="dialog"] button')].filter(vis)
        .find(b=>/QA Bob/i.test(b.innerText||'')); if(!c)return false; c.click(); return true;},VS);
    out.pickedBob=picked; await page.waitForTimeout(1200); }
  // submit
  await page.evaluate((vs)=>{const vis=eval(vs);const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis)[0];
    [...d.querySelectorAll('button')].filter(vis).find(b=>/^Schedule meeting$/i.test((b.innerText||'').trim()))?.click();},VS);
  await page.waitForTimeout(4500);
  out.requests=reqs; out.title=title;
  out.dialogStillOpen = await page.evaluate((vs)=>{const vis=eval(vs);return [...document.querySelectorAll('[role="dialog"]')].filter(vis).length>0;},VS);
  return out;
};
