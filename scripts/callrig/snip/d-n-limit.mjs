export default async ({page}) => {
  const id=process.env.QA_MID, v=process.env.QA_VAL;
  const out={val:v};
  const s = page.locator('[data-testid="call-controls-settings-toggle"]').first();
  if (await s.getAttribute('aria-pressed')!=='true'){ const b=await s.boundingBox(); await page.mouse.click(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(2500); }
  const f = page.locator('[data-testid="meeting-settings-max-participants-input"]').first();
  out.attrs = await f.evaluate(e=>({type:e.type,min:e.min,max:e.max,step:e.step,v:e.value}));
  await f.click(); await f.fill(''); await f.type(v,{delay:40}); await page.waitForTimeout(600);
  out.typed = await f.inputValue();
  const save = page.locator('[data-testid="meeting-settings-save"]').first();
  out.saveDisabled = await save.isDisabled();
  out.inlineBefore = await page.evaluate(()=>{
    const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    const p=document.querySelector('[data-testid="meeting-settings-panel"]');
    return [...new Set([...p.querySelectorAll('*')].filter(e=>e.children.length===0&&e.innerText&&/limit|must|least|enter|invalid|between|particip/i.test(e.innerText)&&vis(e)).map(e=>e.innerText.replace(/\s+/g,' ').trim().slice(0,90)))];});
  if(!out.saveDisabled){ const b=await save.boundingBox(); await page.mouse.click(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(4000); }
  out.toasts = await page.evaluate(()=>[...document.querySelectorAll('[data-sonner-toast]')].map(t=>(t.innerText||'').replace(/\s+/g,' ').slice(0,140)));
  out.inlineAfter = await page.evaluate(()=>{
    const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    const p=document.querySelector('[data-testid="meeting-settings-panel"]');
    return [...new Set([...p.querySelectorAll('*')].filter(e=>e.children.length===0&&e.innerText&&/limit|must|least|enter|invalid|between|particip/i.test(e.innerText)&&vis(e)).map(e=>e.innerText.replace(/\s+/g,' ').trim().slice(0,90)))];});
  out.server = await page.evaluate(async(id)=>{const r=await fetch(`/api/v1/meeting/${id}`,{credentials:'include'});
    const j=JSON.parse(await r.text()).meeting; return {max_participants:j.max_participants};}, id);
  out.fieldAfter = await f.inputValue().catch(()=>null);
  return out;
};
