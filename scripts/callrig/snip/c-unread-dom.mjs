export default async ({page}) => {
  const V=`(e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;})`;
  return await page.evaluate(v=>{const vv=eval(v);
    const a=[...document.querySelectorAll('a[href*="/c/"]')].filter(vv).find(x=>/qa-general/.test(x.innerText));
    return {visibility:document.visibilityState, hasFocus:document.hasFocus(), url:location.pathname,
      entryText:a?a.innerText.replace(/\s+/g,' ').trim():null,
      aria:a?a.getAttribute('aria-label'):null,
      html:a?a.outerHTML.replace(/\s+/g,' ').slice(0,420):'ABSENT'};}, V);
};
