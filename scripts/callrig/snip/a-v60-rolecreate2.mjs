const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/role/i.test(u)&&r.request().method()!=='GET'){
    let b=null;try{b=(await r.text()).slice(0,140);}catch(e){}
    net.push({m:r.request().method(),u:u.split('/api/v1/')[1]?.slice(0,44),s:r.status(),req:(r.request().postData()||'').slice(0,140),res:b});}});
  await page.locator('button',{hasText:/^Create role$/}).first().click();
  const poll=[];
  for(let i=0;i<8;i++){ poll.push(await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    return { dlg:d?(d.innerText||'').replace(/\s+/g,' ').slice(0,120):null, url:location.pathname+location.search,
      newInputs:[...document.querySelectorAll('input[type=text]')].filter(vis).map(i=>(i.placeholder||'').slice(0,22)) };},VS));
    await page.waitForTimeout(700); }
  out.seq = poll.filter((p,i)=>i===0||JSON.stringify(p)!==JSON.stringify(poll[i-1]));
  const nm='V60Role'+Math.floor(Date.now()/1000%10000);
  const ti = await page.$('[role="dialog"] input[type=text], [role="dialog"] input:not([type])');
  if(ti){ await ti.click(); await page.keyboard.type(nm,{delay:20}); out.typed=nm; await page.waitForTimeout(800);
    out.submitBtns = await page.evaluate((vs)=>{const vis=eval(vs);
      const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
      return [...(d?.querySelectorAll('button')||[])].filter(vis).map(b=>({t:(b.innerText||'').trim().slice(0,20),dis:b.disabled}));},VS);
    for(const rx of [/^Create$/,/^Create role$/,/^Save$/]){
      const b=page.locator('[role="dialog"] button').filter({hasText:rx}).first();
      if(await b.count()){ await b.click().catch(()=>{}); out.submitted=String(rx); break; } }
    await page.waitForTimeout(5000); }
  out.requests=net;
  return out;
};
