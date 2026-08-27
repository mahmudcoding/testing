export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const V=`(e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;})`;
  const state = await page.evaluate(v=>{const vv=eval(v);
    const a=[...document.querySelectorAll('a[href*="/c/"]')].filter(vv).find(x=>/qa-general/.test(x.innerText));
    return {visibility:document.visibilityState, hasFocus:document.hasFocus(), url:location.pathname,
      entryHTML:a?a.outerHTML.replace(/\s+/g,' ').slice(0,400):'ABSENT',
      entryText:a?a.innerText.replace(/\s+/g,' ').trim():null,
      aria:a?a.getAttribute('aria-label'):null,
      descendants:a?[...a.querySelectorAll('*')].map(e=>({tag:e.tagName, cls:String(e.className).slice(0,28), t:(e.textContent||'').trim().slice(0,18), vis:vv(e)})).slice(0,12):[]};}, V);
  const api = await page.evaluate(async (w)=>{
    const out={};
    const r=await fetch(`/api/v1/workspaces/${w}/unread`,{credentials:'include'});
    out.unread={s:r.status, b:(await r.text()).slice(0,400)};
    return out;
  }, ws);
  return {clientState: state, api};
};
