export default async ({page}) => {
  const V=`(e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;})`;
  return await page.evaluate(v=>{const vv=eval(v);
    const nodes=[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&/PING2/.test(e.textContent)&&vv(e));
    const n=nodes[0];
    let ctx=null;
    if(n){ let p=n; for(let i=0;i<4&&p.parentElement;i++) p=p.parentElement; ctx=p.innerText.replace(/\s+/g,' ').slice(0,220); }
    const main=document.querySelector('main')||document.body;
    return {leafText:n?n.textContent.trim().slice(0,80):null, context:ctx,
      mainHead:main.innerText.replace(/\s+/g,' ').slice(0,180)};}, V);
};
