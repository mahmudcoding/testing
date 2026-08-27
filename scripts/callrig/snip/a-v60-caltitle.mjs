const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const reqs=[];
  page.on('response', async r=>{const u=r.url(); if(/\/api\/v1\/calendar/.test(u)&&r.request().method()!=='GET'){
    let b=null;try{b=(await r.text()).slice(0,220);}catch(e){}
    reqs.push({m:r.request().method(),u:u.split('/api/v1/')[1].slice(0,40),s:r.status(),res:b});}});
  const dlg = () => page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis)[0]; if(!d) return {noDialog:true};
    const ti=[...d.querySelectorAll('input')].filter(vis)[0];
    return { titleVal:(ti?.value||'').length, titleInvalid:ti?.getAttribute('aria-invalid'),
      errors:[...d.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/too long|maximum|max |limit|characters|required|invalid/i.test(e.innerText||'')).map(e=>e.innerText.trim().slice(0,70)),
      submitDisabled:(()=>{const b=[...d.querySelectorAll('button')].filter(vis).find(b=>/^(create|schedule|save)/i.test((b.innerText||'').trim())); return b?b.disabled:null;})(),
      submitLabel:(()=>{const b=[...d.querySelectorAll('button')].filter(vis).find(b=>/^(create|schedule|save)/i.test((b.innerText||'').trim())); return b?b.innerText.trim().slice(0,20):null;})() };},VS);
  out.dialogOpen = await dlg();
  const ti = await page.$('[role="dialog"] input');
  await ti.click();
  const long = 'V60-LONGTITLE-'+'x'.repeat(400);
  await page.evaluate(([vs,val])=>{const vis=eval(vs);const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis)[0];
    const i=[...d.querySelectorAll('input')].filter(vis)[0];
    const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
    setter.call(i,val); i.dispatchEvent(new Event('input',{bubbles:true})); i.dispatchEvent(new Event('change',{bubbles:true}));},[VS,long]);
  await page.waitForTimeout(1400);
  out.afterLongTitle = await dlg();
  // try to submit
  await page.evaluate((vs)=>{const vis=eval(vs);const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis)[0];
    [...d.querySelectorAll('button')].filter(vis).find(b=>/^(create|schedule|save)/i.test((b.innerText||'').trim()))?.click();},VS);
  const poll=[]; for(let i=0;i<10;i++){ poll.push({t:i*450,...(await dlg())}); await page.waitForTimeout(450); }
  out.afterSubmit = poll[poll.length-1];
  out.errorSeen = poll.find(p=>p.errors&&p.errors.length)?.errors ?? null;
  out.requests = reqs;
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/cal-longtitle.png'});
  return out;
};
