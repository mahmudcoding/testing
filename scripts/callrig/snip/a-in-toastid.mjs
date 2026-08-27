export default async ({page}) => {
  return await page.evaluate(()=>{
    const hits=[...document.querySelectorAll('*')].filter(e=>{
      const own=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('').trim();
      return /unmuted|muted your microphone/i.test(own);
    });
    return hits.slice(0,6).map(e=>{const r=e.getBoundingClientRect();
      const mid=document.elementFromPoint(r.left+r.width/2, r.top+r.height/2);
      let n=e,o=1; while(n&&n!==document.documentElement){o*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}
      return {txt:(e.textContent||'').trim().slice(0,60), tag:e.tagName,
        cls:(e.className||'').toString().slice(0,80),
        rect:[Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)],
        opacity:+o.toFixed(2), hitSelf: mid ? (mid===e||e.contains(mid)) : false,
        role:(e.closest('[role]')||{}).getAttribute? e.closest('[role]').getAttribute('role'):null};
    });
  });
};
