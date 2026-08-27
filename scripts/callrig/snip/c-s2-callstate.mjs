export default async ({page}) => page.evaluate(()=>{
  const v=(e)=>{const r=e.getBoundingClientRect(); if(r.width<3||r.height<3) return false;
    let o=1,n=e; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
      o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden') return false; n=n.parentElement;}
    return o>0.05;};
  const dialogs=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(v)
    .map(d=>({text:(d.innerText||'').replace(/\s+/g,' ').slice(0,90),
      buttons:[...d.querySelectorAll('button')].filter(v)
        .map(b=>b.getAttribute('aria-label')||(b.innerText||'').trim().slice(0,20)).filter(Boolean)}));
  const backdrops=[...document.querySelectorAll('.aloqa-modal-backdrop')].length;
  return {url:location.pathname.slice(-26), dialogs, backdrops,
    topButtons:[...document.querySelectorAll('button')].filter(v)
      .map(b=>b.getAttribute('aria-label')).filter(Boolean).slice(0,16)};});
