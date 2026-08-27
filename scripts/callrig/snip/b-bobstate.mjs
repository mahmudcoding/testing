export default async ({page}) => {
  return await page.evaluate(async ()=>{
    const vis = el => { const r=el.getBoundingClientRect(); if(r.width===0||r.height===0) return false;
      let o=1,n=el; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden') return false; o*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return o>0.05; };
    const notif = await (await fetch('/api/v1/notifications?limit=5',{credentials:'include'})).json().catch(()=>null);
    const arr = (notif && (notif.notifications||notif.items||notif.data)) || [];
    return {
      visibilityState: document.visibilityState,
      hasFocus: document.hasFocus(),
      url: location.href,
      allButtons: [...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,40),
      acceptDecline: [...document.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.innerText||'')).filter(t=>/accept|decline|answer|reject|incoming/i.test(t)),
      bodyHasIncoming: /incoming call|is calling|wants to call/i.test(document.body.innerText),
      notifTop: arr.slice(0,4).map(n=>({type:n.type||n.kind, title:(n.title||'').slice(0,60), body:(n.body||n.message||'').slice(0,80), read:n.read_at||n.is_read})),
      curMeeting: await (async()=>{ const r=await fetch('/api/v1/meetings/current',{credentials:'include'}); const j=await r.json().catch(()=>null); return j&&j.meeting? {id:j.meeting.id,name:j.meeting.name,status:j.meeting.status} : null; })()
    };
  });
};
