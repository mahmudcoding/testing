const WS='W4QCF1XTURESO01', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  const out={};
  out.beforeOpen = await page.evaluate(async (ws)=>{
    const r=await fetch(`/api/v1/workspaces/${ws}/unread`,{credentials:'include'});
    const j=await r.json();
    const g=(j.unread_counts||[]).find(c=>c.channel_id==='C4QCGENERAL0001');
    return {gen:g, url:location.href};
  }, WS);
  // click the sidebar entry, like a user
  await page.locator(`a[href*="${GEN}"]`).first().click({timeout:8000});
  await page.waitForTimeout(4500);
  out.afterOpen = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
      let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
    const divider=[...document.querySelectorAll('div,span,p,hr')].filter(e=>e.children.length===0 && /new message|unread|New$/i.test(e.textContent||''))
      .map(e=>{const r=e.getBoundingClientRect(); return {t:(e.textContent||'').trim().slice(0,40), vis:vis(e), y:Math.round(r.y)};});
    const msgs=[...document.querySelectorAll('[data-message-id]')];
    const targets=['M4OWLBWNV51WQF9','M4OWLBYG4P183V1','M4OWLBZHNOLOG1M'].map(id=>{
      const el=document.querySelector(`[data-message-id="${id}"]`);
      if(!el) return {id, present:false};
      const r=el.getBoundingClientRect();
      return {id, present:true, y:Math.round(r.y), inViewport: r.y>=0 && r.y<innerHeight, text:el.innerText.replace(/\n+/g,' ').slice(0,40)};
    });
    return {url:location.href, msgCount:msgs.length, divider, targets, viewportH:innerHeight,
      bodyHasNewMessages: /new messages/i.test(document.body.innerText)};
  });
  await page.waitForTimeout(2500);
  out.unreadAfter = await page.evaluate(async (ws)=>{
    const r=await fetch(`/api/v1/workspaces/${ws}/unread`,{credentials:'include'}); const j=await r.json();
    return (j.unread_counts||[]).find(c=>c.channel_id==='C4QCGENERAL0001');
  }, WS);
  return out;
};
