const CH='C4OWKQTPC7FZ35V';
export default async ({page}) => {
  const out={};
  out.now = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
      let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
    const st=[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis);
    return {statusBlocks: st.map(s=>({text:s.innerText.replace(/\n+/g,' | ').slice(0,120),
      buttons:[...s.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,24))})),
      allButtonsTail: [...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,26)).filter(Boolean).slice(-14)};
  });
  return out;
};
