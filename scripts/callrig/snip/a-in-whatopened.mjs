export default async ({page}) => {
  return await page.evaluate(()=>{
    const vis=e=>{const q=e.getBoundingClientRect(); if(q.width<3||q.height<3) return false;
      let n=e,o=1; while(n&&n!==document.documentElement){const s=getComputedStyle(n); o*=parseFloat(s.opacity||'1'); if(s.display==='none'||s.visibility==='hidden') return false; n=n.parentElement;}
      return o>0.05;};
    const dlgs=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis).map(d=>{
      const q=d.getBoundingClientRect();
      return {tid:d.getAttribute('data-testid'), rect:[Math.round(q.left),Math.round(q.top),Math.round(q.width),Math.round(q.height)],
        text:(d.innerText||'').replace(/\s+/g,' ').slice(0,160)};});
    const bd=[...document.querySelectorAll('.aloqa-modal-backdrop')].map(b=>{const q=b.getBoundingClientRect();
      const mid=document.elementFromPoint(Math.min(q.width/2,900), Math.min(q.height/2,500));
      return {state:b.getAttribute('data-state'), rect:[Math.round(q.width),Math.round(q.height)],
        hitAtCentre: mid?(mid.className||'').toString().slice(0,40)+'|'+mid.tagName:null};});
    return {dialogs:dlgs, backdrops:bd};
  });
};
