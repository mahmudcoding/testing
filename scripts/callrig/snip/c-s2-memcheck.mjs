export default async ({page}) => page.evaluate(async ()=>{
  const r=await fetch('/api/v1/channels/C4QCPRIVATE0001/members',{credentials:'include'});
  let j=null; try{j=await r.json()}catch{}
  const a=(j&&(j.members||j.items||j))||[];
  const v=(e)=>{const b=e.getBoundingClientRect();return b.width>3&&b.height>3;};
  const W=innerWidth;
  const names=[...document.querySelectorAll('button')].filter(v)
    .filter(e=>e.getBoundingClientRect().left>W*0.7)
    .map(e=>(e.getAttribute('aria-label')||'').trim())
    .filter(t=>/^(Open|Remove) /.test(t));
  const tab=[...document.querySelectorAll('button[aria-selected]')].filter(v)
    .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,12)+'='+e.getAttribute('aria-selected'));
  return {serverMembers:Array.isArray(a)?a.length:null,
    serverNames:(Array.isArray(a)?a:[]).map(m=>m.display_name||m.name||m.user_id||'?').slice(0,5),
    uiRowControls:[...new Set(names)], tabs:tab.join(' ')};
});
