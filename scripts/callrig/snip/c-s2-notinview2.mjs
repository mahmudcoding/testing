const WS='W4QCF1XTURESO01', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  const out={};
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`,{waitUntil:'load'});
  await page.waitForTimeout(7000);
  const oldest = await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=100`,{credentials:'include'});
    const j=await r.json(); const l=j.messages||[]; const o=l[l.length-1];
    return {id:o.id, body:(o.body||'').slice(0,22), n:l.length};
  }, GEN);
  out.oldest = oldest;
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}?m=${oldest.id}`,{waitUntil:'load'});
  await page.waitForTimeout(8000);
  const look=(t)=>page.evaluate((tag)=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
      let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
    let sc=null; for (const e of document.querySelectorAll('div')) {
      if (e.scrollHeight>e.clientHeight+50 && e.clientHeight>300 && e.querySelector('[data-message-id]')) { sc=e; break; } }
    const cand=[...document.querySelectorAll('button,div,p,span')].filter(e=>e.children.length<4 &&
      /new message|jump|scroll|latest|not in view|below|unread/i.test(e.textContent||'')).filter(vis)
      .map(e=>({t:(e.textContent||'').trim().slice(0,60), tag:e.tagName, label:e.getAttribute('aria-label')}));
    const btns=[...document.querySelectorAll('button')].filter(vis)
      .map(b=>(b.getAttribute('aria-label')||'').trim()).filter(t=>/scroll|jump|bottom|latest|new/i.test(t));
    return {tag, scroll: sc?{top:Math.round(sc.scrollTop), h:Math.round(sc.scrollHeight), ch:Math.round(sc.clientHeight)}:null,
      candidates: cand.slice(0,6), scrollBtns:[...new Set(btns)]};
  }, t);
  out.parked = await look('parked-at-old-message');

  return out;
};
