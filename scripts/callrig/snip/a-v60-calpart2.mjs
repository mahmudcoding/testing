const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const reqs=[];
  page.on('response', async r=>{const u=r.url(); if(/\/api\/v1\/calendar/.test(u)&&r.request().method()!=='GET'){
    let b=null;try{b=(await r.text()).slice(0,150);}catch(e){}
    reqs.push({m:r.request().method(),s:r.status(),req:(r.request().postData()||'').slice(0,400),res:b});}});
  const formState = () => page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis)[0]; if(!d)return{noDialog:true};
    const t=(d.innerText||'').replace(/\s+/g,' ');
    return { mentionsBob:/QA Bob/.test(t),
             participantsArea:(t.match(/Participants[^]{0,120}/)||[''])[0].slice(0,120),
             searchVal:([...d.querySelectorAll('input')].filter(vis).find(i=>i.placeholder==='Search members')?.value)||'' };},VS);
  out.beforeClick = await formState();
  // real mouse click on the suggestion button
  const btn = page.locator('[role="dialog"] button', { hasText: 'QA Bob' }).first();
  await btn.click();
  await page.waitForTimeout(1800);
  out.afterClick = await formState();
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/cal-bob-added.png'});
  // set a title then submit
  const title='V60 Participant Check '+Math.floor(Date.now()/1000%100000);
  await page.evaluate(([vs,val])=>{const vis=eval(vs);const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis)[0];
    const i=[...d.querySelectorAll('input')].filter(vis)[0];
    const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
    s.call(i,val); i.dispatchEvent(new Event('input',{bubbles:true}));},[VS,title]);
  await page.waitForTimeout(700);
  await page.locator('[role="dialog"] button', { hasText: 'Schedule meeting' }).first().click();
  await page.waitForTimeout(4200);
  out.title=title; out.requests=reqs;
  return out;
};
