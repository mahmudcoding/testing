export default async ({page}) => {
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  const state = await page.evaluate((v)=>{ const vis=eval(v);
    const ta=[...document.querySelectorAll('textarea')].filter(vis)[0];
    const notice=document.querySelector('[data-testid="in-call-chat-disabled"]');
    const panel=document.querySelector('[data-testid="in-call-chat-panel"]');
    return {
      textarea: ta?{vis:true, disabled:ta.disabled, readOnly:ta.readOnly, ph:ta.placeholder, ariaDisabled:ta.getAttribute('aria-disabled')}:null,
      noticeText: notice?(notice.innerText||'').replace(/\s+/g,' ').trim().slice(0,160):null,
      noticeVisible: notice?vis(notice):null,
      panelText: panel?(panel.innerText||'').replace(/\n+/g,' | ').slice(0,300):null,
      sendBtn: (()=>{const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^send$/i.test((x.innerText||'').trim())); return b?{dis:b.disabled}:null;})()
    }; }, V);
  return state;
};
