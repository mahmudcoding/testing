export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const V=`(e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;})`;
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/mentions`, {waitUntil:'load'});
  await page.waitForTimeout(4500);
  const dom = await page.evaluate(v=>{const vv=eval(v);
    const items=[...document.querySelectorAll('[data-message-id]')].map(m=>({id:m.getAttribute('data-message-id'), t:m.innerText.replace(/\s+/g,' ').trim().slice(0,120)}));
    const main=document.querySelector('main')||document.body;
    return {count:items.length, items:items.slice(-4), hasPing:/PING2/.test(document.body.innerText),
      emptyish:/no mention|nothing|empty/i.test(main.innerText)};}, V);
  const api = await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/notifications?limit=6',{credentials:'include'});
    let j=null; try{j=await r.json();}catch(e){}
    const arr=(j&&(j.notifications||j.data||j))||[];
    return {status:r.status, n:Array.isArray(arr)?arr.length:0,
      top:(Array.isArray(arr)?arr:[]).slice(0,3).map(x=>({type:x.type, body:(x.body||x.message||'').slice(0,60)}))};
  });
  return {mentionsPage: dom, notifications: api};
};
