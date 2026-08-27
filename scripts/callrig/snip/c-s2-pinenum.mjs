export default async ({page}) => page.evaluate(()=>{
  const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
  const b=[...document.querySelectorAll('button,a,[role="button"]')].filter(v)
    .find(x=>/pin/i.test(x.getAttribute('aria-label')||x.innerText||''));
  if(!b) return {banner:'NO-BANNER'};
  let n=b; for(let i=0;i<3&&n.parentElement;i++) n=n.parentElement;
  const kids=[...n.querySelectorAll('button,a,[role="button"],[onclick],svg')].filter(v)
    .map(e=>{const r=e.getBoundingClientRect();return {
      tag:e.tagName.toLowerCase(),
      aria:(e.getAttribute('aria-label')||'').slice(0,40),
      text:(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,30),
      x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height)};});
  return {containerText:(n.innerText||'').replace(/\s+/g,' ').trim().slice(0,90),
          interactive:kids.slice(0,10)};
});
