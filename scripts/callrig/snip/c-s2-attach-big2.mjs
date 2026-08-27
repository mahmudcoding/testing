const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(6000);
  const state = (t) => page.evaluate((tag)=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
      let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
    const c=[...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')].pop();
    let box=c; for(let i=0;i<6&&box;i++) box=box.parentElement;
    return {tag, composerArea: box? box.innerText.replace(/\n+/g,' | ').slice(-220):null,
      toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis).map(e=>(e.textContent||'').trim()).filter(Boolean).slice(0,4),
      sendDisabled: (()=>{const s=[...document.querySelectorAll('button[aria-label="Send"]')].pop(); return s?s.disabled:null;})()};
  }, t);
  const out={};
  out.before = await state('before');
  out.inject = await page.evaluate(async ()=>{
    const inp=[...document.querySelectorAll('input[type=file]')].pop();
    if(!inp) return {err:'no input'};
    try {
      const size = 120*1024*1024;
      const blob = new Blob([new Uint8Array(size)], {type:'image/png'});
      const f = new File([blob], 'qa-s2-oversize.png', {type:'image/png'});
      const dt = new DataTransfer(); dt.items.add(f);
      inp.files = dt.files;
      inp.dispatchEvent(new Event('change', {bubbles:true}));
      return {ok:true, size:f.size, name:f.name};
    } catch(e){ return {err:String(e).slice(0,120)}; }
  });
  await page.waitForTimeout(6000);
  out.after = await state('after-120MB');
  return out;
};
