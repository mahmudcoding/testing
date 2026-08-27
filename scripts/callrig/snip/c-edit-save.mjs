export default async ({page}) => {
  const id=process.env.MID;
  const V=`(e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;})`;
  const probe = await page.evaluate(v=>{const vv=eval(v);
    return [...document.querySelectorAll('button')].filter(vv)
      .filter(b=>/save/i.test((b.getAttribute('aria-label')||'')+' '+(b.innerText||'')))
      .map(b=>({aria:b.getAttribute('aria-label'), txt:(b.innerText||'').replace(/\s+/g,' ').trim(), dis:b.disabled,
                r:(()=>{const q=b.getBoundingClientRect();return Math.round(q.left)+','+Math.round(q.top)+' '+Math.round(q.width)+'x'+Math.round(q.height);})()}));}, V);
  let saved='no';
  const byAria = page.locator('button[aria-label="Save changes"]').first();
  if(await byAria.count()){ try{ await byAria.click({timeout:8000}); saved='clicked via aria-label'; }catch(e){ saved='aria click fail'; } }
  else {
    // fall back to DOM click on the matching button
    const ok = await page.evaluate(v=>{const vv=eval(v);
      const b=[...document.querySelectorAll('button')].filter(vv).find(x=>/^Save changes$/i.test((x.innerText||'').trim()));
      if(b){b.click(); return true;} return false;}, V);
    saved = ok?'clicked via DOM':'button not found';
  }
  await page.waitForTimeout(3500);
  const api = await page.evaluate(async mid=>{
    const r=await fetch('/api/v1/messaging/channels/C4QCGENERAL0001/messages?limit=4',{credentials:'include'});
    const j=await r.json(); const arr=j.messages||j.data||j;
    const m=(Array.isArray(arr)?arr:[]).find(x=>x.id===mid);
    return m?{body:m.body, created:m.created_at, updated:m.updated_at}:{notFound:true};
  }, id);
  const own = await page.evaluate(mid=>{const x=document.querySelector(`[data-message-id="${mid}"]`);
    return x?x.innerText.replace(/\s+/g,' ').slice(0,110):'ABSENT';}, id);
  return {saveButtons: probe, saved, apiAfterEdit: api, authorView: own};
};
