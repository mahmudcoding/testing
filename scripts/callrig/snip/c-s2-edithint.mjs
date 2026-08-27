export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={}; const tag='QAHINT';
  await page.evaluate(async ({ch,tag})=>{ await fetch('/api/v1/messaging/messages',{method:'POST',
    credentials:'include',headers:{'content-type':'application/json'},
    body:JSON.stringify({channel_id:ch, body:tag+' base'})}); }, {ch,tag});
  await page.waitForTimeout(2500);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(8500);
  const vis=async(label)=>await page.evaluate(()=>{
    const nodes=[...document.querySelectorAll('body *')].filter(e=>e.children.length===0)
      .filter(e=>/Enter to send/i.test(e.textContent||''));
    return nodes.map(n=>{
      const r=n.getBoundingClientRect();
      let op=1, node=n, hidden=false;
      while(node && node!==document.documentElement){
        const cs=getComputedStyle(node);
        op*=parseFloat(cs.opacity||'1');
        if(cs.display==='none'||cs.visibility==='hidden') hidden=true;
        if(node.getAttribute&&node.getAttribute('aria-hidden')==='true') hidden=true;
        node=node.parentElement;
      }
      const cx=Math.round(r.left+r.width/2), cy=Math.round(r.top+r.height/2);
      const at=document.elementFromPoint(cx,cy);
      return {text:(n.textContent||'').trim().slice(0,44), x:Math.round(r.left),
        y:Math.round(r.top), opacityProduct:+op.toFixed(2), hidden,
        hitSelf: !!(at && (at===n || n.contains(at) || at.contains(n)))};});});
  out.beforeEdit=await vis();
  const msg=page.locator('[data-message-id]').filter({hasText:tag}).last();
  await msg.hover(); await page.waitForTimeout(1300);
  await msg.locator('button[aria-label="More actions"]').first().click({timeout:6000});
  await page.waitForTimeout(1400);
  await page.locator('[role="menuitem"]').filter({hasText:/^Edit/}).first().click();
  await page.waitForTimeout(2200);
  out.duringEdit=await vis();
  // third reproduction of Enter doing nothing
  const box=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  await box.click(); await page.keyboard.press('End'); await page.keyboard.type(' ZZ');
  await page.waitForTimeout(700);
  const reqs=[]; const h=r=>{ const p=new URL(r.url()).pathname;
    if(/\/messaging\//.test(p)&&r.method()!=='GET') reqs.push(r.method()); };
  page.on('request',h);
  await page.keyboard.press('Enter'); await page.waitForTimeout(5000); page.off('request',h);
  out.enterRun3={reqs, len:await page.evaluate(async ({ch,tag})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=8`,{credentials:'include'});
    const j=await r.json(); const a=j.messages||j.data||[];
    return a.filter(m=>(m.body||'').includes(tag)).map(m=>(m.body||'').length);}, {ch,tag})};
  out.stillEditing=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4;};
    return [...document.querySelectorAll('[role="status"],[data-sonner-toast]')].filter(v)
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,30));});
  return out;
};
