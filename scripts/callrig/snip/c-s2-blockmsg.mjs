export default async ({page}) => {
  const out={};
  const h=await page.evaluateHandle(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    let host=null;
    for (const e of document.querySelectorAll('*'))
      if(e.children.length===0 && (e.textContent||'').trim()==='QA Dave'){ host=e; break; }
    if(!host) return null;
    let n=host;
    for(let i=0;i<6&&n;i++){ n=n.parentElement; if(!n) break;
      const b=[...n.querySelectorAll('button')].filter(v)
        .find(x=>/^message$/i.test((x.innerText||x.getAttribute('aria-label')||'').trim()));
      if(b) return b;}
    return null;});
  const el=h.asElement();
  out.messageButton=!!el;
  if(el){
    out.disabled=await el.evaluate(b=>({disabled:b.disabled, aria:b.getAttribute('aria-disabled'),
      pointerEvents:getComputedStyle(b).pointerEvents}));
    await el.click({timeout:6000}).catch(()=>{out.clickFail=true});
  }
  await page.waitForTimeout(6000);
  out.after=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const main=document.querySelector('main');
    const dlg=[...document.querySelectorAll('[role="dialog"],[role="alert"],[role="status"]')].filter(v)
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,120)).filter(Boolean);
    return {url:location.pathname.slice(0,44),
      mainText:main?(main.innerText||'').replace(/\s+/g,' ').trim().slice(0,180):'NO-MAIN',
      alerts:dlg.slice(0,2),
      composer:!!document.querySelector('div[contenteditable][aria-label="Compose message"]')};});
  return out;
};
