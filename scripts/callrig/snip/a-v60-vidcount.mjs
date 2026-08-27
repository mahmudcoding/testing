const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const who = await page.evaluate(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});
    if(r.status!==200) return 'guest'; const j=await r.json().catch(()=>null); return (j?.email||'').split('@')[0];});
  return await page.evaluate(([vs,who])=>{const vis=eval(vs);
    return { who, videos:[...document.querySelectorAll('video')].map(v=>({rw:Math.round(v.getBoundingClientRect().width),vw:v.videoWidth})),
      pinAria:[...document.querySelectorAll('button[aria-label]')].filter(vis).map(b=>b.getAttribute('aria-label')).filter(a=>/pin/i.test(a||'')).slice(0,4),
      shareLabels:[...document.body.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/screen$/i.test((e.innerText||'').trim())).map(e=>e.innerText.trim().slice(0,24)) };},[VS,who]);
};
