export default async ({page}) => await page.evaluate(() => {
  const t=(document.body.innerText||'').replace(/\s+/g,' ');
  const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,o=1; while(n&&n!==document.documentElement){const c=getComputedStyle(n);
      if(c.display==='none'||c.visibility==='hidden') return false; o*=parseFloat(c.opacity||'1'); n=n.parentElement;} return o>0.01;};
  const banners=[...document.querySelectorAll('[role=status],[role=alert],[class*=banner],[class*=Banner]')]
    .filter(vis).map(e=>(e.textContent||'').replace(/\s+/g,' ').trim().slice(0,60)).filter(Boolean);
  return { bannerNow:[...new Set(banners)].slice(0,4),
           connectingVisible: /Connecting…|Reconnecting/.test(t),
           hasMissedToken: t.includes('missedwhileoffline'),
           msgCount: document.querySelectorAll('[data-message-id]').length,
           lastMsg: (()=>{const n=[...document.querySelectorAll('[data-message-id]')].pop();
             return n?(n.textContent||'').replace(/\s+/g,' ').trim().slice(-70):null;})() };
});
