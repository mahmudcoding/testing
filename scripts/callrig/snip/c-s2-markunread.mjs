export default async ({page}) => {
  const ws='W4QCF1XTURESO01', gen='C4QCGENERAL0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${gen}`);
  await page.waitForTimeout(9000);
  // pick a message ~8 from the end
  const ids=await page.evaluate(()=>[...document.querySelectorAll('main [data-message-id]')]
    .map(e=>({id:e.getAttribute('data-message-id'), t:(e.innerText||'').replace(/\s+/g,' ').slice(-22)})));
  const target=ids[ids.length-8];
  out.target=target;
  const el=page.locator(`main [data-message-id="${target.id}"]`);
  await el.scrollIntoViewIfNeeded();
  await el.hover(); await page.waitForTimeout(1200);
  // enumerate the hover toolbar
  out.hoverControls=await page.evaluate((id)=>{
    const v=(e)=>{const r=e.getBoundingClientRect(); if(r.width<3||r.height<3) return false;
      let o=1,n=e; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden') return false; n=n.parentElement;}
      return o>0.05;};
    const m=document.querySelector(`main [data-message-id="${id}"]`);
    return [...m.querySelectorAll('button,[role="button"]')].filter(v)
      .map(e=>({al:e.getAttribute('aria-label'), t:(e.innerText||'').replace(/\s+/g,' ').slice(0,18)}));
  }, target.id);
  // open the overflow menu
  const more=el.locator('button[aria-label="More actions"], button[aria-label="More"]').first();
  out.moreCount=await more.count();
  if(out.moreCount){
    await more.click(); await page.waitForTimeout(1600);
    out.menuItems=await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      const m=[...document.querySelectorAll('[role="menu"],[data-radix-popper-content-wrapper]')].filter(v)[0];
      if(!m) return 'no menu';
      return (m.innerText||'').split('\n').map(s=>s.trim()).filter(Boolean);});
    const mu=page.getByText(/^Mark (as )?unread$/i).first();
    out.hasMarkUnread=await mu.count();
    if(out.hasMarkUnread){
      await mu.click(); await page.waitForTimeout(3500);
      out.afterClick=await page.evaluate(async({ws,gen})=>{
        const r=await fetch(`/api/v1/workspaces/${ws}/unread`,{credentials:'include'});
        const j=await r.json().catch(()=>({}));
        const u=(j.unread_counts||[]).find(c=>c.channel_id===gen)||{note:'absent'};
        const v=(e)=>{const r=e.getBoundingClientRect(); if(r.width<3||r.height<3) return false;
          let o=1,n=e; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
            o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden') return false; n=n.parentElement;}
          return o>0.05;};
        const main=document.querySelector('main');
        const leaves=[...main.querySelectorAll('*')].filter(e=>e.children.length===0&&v(e));
        const d=leaves.find(e=>/^(New|New messages|Unread)$/i.test((e.textContent||'').trim()));
        const side=[...document.querySelectorAll('nav a, aside a')].find(x=>/qa-general/.test(x.innerText||''));
        return {unread:u, dividerLabel:d?(d.textContent||'').trim():null,
          sidebar:side?(side.innerText||'').replace(/\s+/g,' ').slice(0,30):null};
      },{ws,gen});
    } else {
      await page.keyboard.press('Escape');
    }
  }
  return out;
};
