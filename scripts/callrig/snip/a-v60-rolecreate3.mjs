const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/role/i.test(u)&&r.request().method()!=='GET'){
    let b=null;try{b=(await r.text()).slice(0,150);}catch(e){}
    net.push({m:r.request().method(),u:u.split('/api/v1/')[1]?.slice(0,44),s:r.status(),req:(r.request().postData()||'').slice(0,150),res:b});}});
  const nm='V60Role'+Math.floor(Date.now()/1000%10000);
  const n1=await page.$('input[placeholder="e.g. Moderators"]');
  if(!n1) return {noForm:true};
  await n1.click(); await page.keyboard.type(nm,{delay:20});
  const n2=await page.$('input[placeholder="What this role is for"]');
  if(n2){ await n2.click(); await page.keyboard.type('temporary QA role',{delay:12}); }
  await page.waitForTimeout(800);
  out.buttons = await page.evaluate((vs)=>{const vis=eval(vs);
    return [...document.querySelectorAll('button')].filter(vis).map(b=>({t:(b.innerText||'').trim().slice(0,22),dis:b.disabled}))
      .filter(b=>/create|save|cancel/i.test(b.t));},VS);
  for(const rx of [/^Create role$/,/^Create$/,/^Save$/]){
    const b=page.locator('button').filter({hasText:rx}).first();
    if(await b.count()){ const d=await b.isDisabled().catch(()=>false); if(!d){ await b.click().catch(()=>{}); out.submitted=String(rx); break; } } }
  await page.waitForTimeout(5500);
  out.roleName=nm; out.requests=net;
  out.roleRows = await page.evaluate((vs)=>{const vis=eval(vs);
    const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    return [...m.querySelectorAll('tr')].filter(vis).map(r=>(r.innerText||'').replace(/\s+/g,' ').trim().slice(0,44)).filter(t=>/R4|V60Role/.test(t)).slice(0,6);},VS);
  return out;
};
