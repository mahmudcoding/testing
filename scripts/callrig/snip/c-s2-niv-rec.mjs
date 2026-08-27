export default async ({page}) => {
  return await page.evaluate(()=>{
    if (window.__niv) clearInterval(window.__niv.id);
    const rec={events:[], t0:performance.now()};
    const push=()=>{
      const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
        let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
        if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
      let sc=null; for (const e of document.querySelectorAll('div')) {
        if (e.scrollHeight>e.clientHeight+50 && e.clientHeight>300 && e.querySelector('[data-message-id]')) { sc=e; break; } }
      const btns=[...document.querySelectorAll('button')].filter(vis)
        .map(b=>({l:(b.getAttribute('aria-label')||'').trim(), t:(b.textContent||'').trim().slice(0,40)}))
        .filter(x=>/scroll|latest|new|jump|unread/i.test(x.l+' '+x.t));
      const key=JSON.stringify(btns)+'|'+(sc?Math.round(sc.scrollTop):'')+'|'+document.querySelectorAll('[data-message-id]').length;
      const last=rec.events[rec.events.length-1];
      if(!last||last.key!==key) rec.events.push({key, ms:Math.round(performance.now()-rec.t0), btns,
        n:document.querySelectorAll('[data-message-id]').length,
        top: sc?Math.round(sc.scrollTop):null, vis:document.visibilityState});
    };
    const mo=new MutationObserver(push); mo.observe(document.body,{subtree:true,childList:true,characterData:true});
    rec.id=setInterval(push,400); window.__niv=rec; push();
    return {started:true, events:rec.events.length};
  });
};
