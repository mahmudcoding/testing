export default async ({page}) => {
  const ws='W4QCF1XTURESO01', CH='C4OX4NTD8DNF88E', MID='M4OX4OUB8JACXAW';
  const NORM='C4OX0TTLIMVOUBH';
  const out={};
  const probe=async(ch,mid,label)=>{
    await page.goto('about:blank'); await page.waitForTimeout(600);
    await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
    await page.waitForTimeout(10000);
    const el=page.locator(`main [data-message-id="${mid}"]`);
    if(!await el.count()) return {label, err:'message not rendered'};
    await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(1000);
    const more=el.locator('button[aria-label="More actions"]').first();
    if(!await more.count()) return {label, err:'no More actions'};
    await more.click(); await page.waitForTimeout(1500);
    const menu=await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      const m=[...document.querySelectorAll('[role="menu"],[data-radix-popper-content-wrapper]')].filter(v)[0];
      return m? (m.innerText||'').split('\n').map(s=>s.trim()).filter(Boolean):[];});
    const ed=page.getByText(/^Edit$/).first();
    if(!await ed.count()){ await page.keyboard.press('Escape'); return {label, menu, editItem:false}; }
    const st=await ed.evaluate(e=>{const cs=getComputedStyle(e); const r=e.getBoundingClientRect();
      const hit=document.elementFromPoint(Math.round(r.left+r.width/2),Math.round(r.top+r.height/2));
      return {disabled:e.getAttribute('aria-disabled')||e.disabled===true, pe:cs.pointerEvents,
        opacity:cs.opacity, hitSelf:!!(hit&&(hit===e||e.contains(hit)))};});
    let reqs=0; const h=(r)=>{ if(/\/api\/v1/.test(r.url())) reqs++; };
    page.on('request',h);
    await ed.click(); await page.waitForTimeout(4500);
    page.off('request',h);
    const after=await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      const main=document.querySelector('main');
      const notice=[...main.querySelectorAll('*')].filter(e=>e.children.length===0&&v(e))
        .map(e=>(e.textContent||'').trim()).find(t=>/editing/i.test(t))||null;
      return {editingNotice:notice,
        menusVisible:[...document.querySelectorAll('[role="menu"]')].filter(v).length,
        toasts:[...document.querySelectorAll('[data-sonner-toast],[role="alert"]')].filter(v)
          .map(e=>(e.innerText||'').slice(0,40))};});
    return {label, menu, editItem:true, itemState:st, apiRequestsAfterClick:reqs, after};
  };
  out.archived=await probe(CH, MID, 'archived');
  // control: the same path in a normal channel
  const normMsg=await page.evaluate(async(ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QA-V2-EDITCTL', idempotency_key:'qec2-'+Math.random().toString(36).slice(2)})});
    return (await r.json()).id;}, NORM);
  out.normal=await probe(NORM, normMsg, 'normal');
  out.PASS = out.archived.editItem===true && out.archived.after
    && out.archived.after.editingNotice===null && out.archived.apiRequestsAfterClick===0
    && out.normal.after && out.normal.after.editingNotice!==null;
  return out;
};
