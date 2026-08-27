const WS='W4QCF1XTURESO01', CH='C4OWKU9EANT1XSR';
export default async ({page}) => {
  // deep-link to an old message in the 130-message channel, then look for the banner
  const out={};
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`,{waitUntil:'load'});
  await page.waitForTimeout(8000);
  out.target = await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=100`,{credentials:'include'});
    const j=await r.json(); const list=j.messages||[];
    const old=list[list.length-1];
    return {id:old.id, body:(old.body||'').slice(0,24), total:list.length};
  }, CH);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}?m=${out.target.id}`,{waitUntil:'load'});
  await page.waitForTimeout(8000);
  const look=(t)=>page.evaluate((tag)=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
      let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
    let sc=null; for (const e of document.querySelectorAll('div')) {
      if (e.scrollHeight>e.clientHeight+50 && e.clientHeight>300 && e.querySelector('[data-message-id]')) { sc=e; break; } }
    const banners=[...document.querySelectorAll('button,div,p')].filter(e=>e.children.length<4 &&
      /new message|jump|scroll to|latest|not in view|below/i.test(e.textContent||''))
      .filter(vis).map(e=>(e.textContent||'').trim().slice(0,60));
    return {tag, scroll: sc?{top:Math.round(sc.scrollTop), h:Math.round(sc.scrollHeight), ch:Math.round(sc.clientHeight)}:null,
      banners:[...new Set(banners)].slice(0,6),
      n:document.querySelectorAll('[data-message-id]').length};
  }, t);
  out.afterDeepLink = await look('after-deeplink');
  return out;
};
