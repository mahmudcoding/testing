const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
const F='/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/v60-upload.txt';
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/\/api\/v1\/(files|upload)/.test(u)){
    let b=null;try{b=(await r.text()).slice(0,140);}catch(e){}
    net.push({m:r.request().method(),u:u.split('/api/v1/')[1].slice(0,44),s:r.status(),res:b});}});
  const inputs = await page.$$('input[type=file]');
  out.fileInputs = inputs.length;
  if(!inputs.length){
    await page.locator('button', { hasText: /^Upload$/ }).first().click().catch(()=>{});
    await page.waitForTimeout(2000);
  }
  const inp = (await page.$$('input[type=file]'))[0];
  if(!inp) return {...out, err:'no file input'};
  await inp.setInputFiles(F);
  await page.waitForTimeout(7000);
  out.requests=net;
  out.after = await page.evaluate((vs)=>{const vis=eval(vs);
    const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    return { txt:(m.innerText||'').replace(/\s+/g,' ').slice(0,280),
      hasFile:/v60-upload/i.test(m.innerText||'') };},VS);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/files-uploaded.png'});
  return out;
};
