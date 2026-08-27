export default async ({page}) => {
  return await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
      let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
    return {url:location.href, vis:document.visibilityState,
      buttons:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,26)).filter(Boolean).slice(0,20),
      bodyHas:/incoming|calling|accept|decline|ringing/i.test(document.body.innerText),
      snippet:document.body.innerText.replace(/\n+/g,' | ').slice(0,220)};
  });
};
