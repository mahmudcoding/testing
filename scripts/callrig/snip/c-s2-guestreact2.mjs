export default async ({page}) => page.evaluate(()=>{
  const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
  const cands=[...document.querySelectorAll('[role="dialog"],[role="menu"],[data-radix-popper-content-wrapper],div')]
    .filter(v)
    .map(e=>({el:e, btns:e.querySelectorAll('button').length,
              w:Math.round(e.getBoundingClientRect().width),
              h:Math.round(e.getBoundingClientRect().height)}))
    .filter(x=>x.btns>=20 && x.w>150 && x.w<520 && x.h>150)
    .sort((a,b)=>a.btns-b.btns);
  if(!cands.length) return {found:false,
    anyPopper:document.querySelectorAll('[data-radix-popper-content-wrapper]').length,
    anyDialog:document.querySelectorAll('[role="dialog"]').length};
  const c=cands[0];
  const labels=[...c.el.querySelectorAll('button')].filter(v)
    .map(b=>b.getAttribute('aria-label')||'').filter(Boolean);
  return {found:true, size:`${c.w}x${c.h}`, buttons:c.btns,
    firstLabels:labels.slice(0,8),
    inputs:[...c.el.querySelectorAll('input')].map(i=>i.getAttribute('placeholder')||'(none)'),
    head:(c.el.innerText||'').replace(/\s+/g,' ').trim().slice(0,60)};
});
