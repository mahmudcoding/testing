export default async ({page}) => {
  return await page.evaluate(()=>{
    const vis = el=>{if(!el)return false;const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    const tr=[...document.querySelectorAll('[data-testid="screen-share-track"]')];
    const th=[...document.querySelectorAll('[data-testid="share-thumbnail"],[data-testid="screen-share-thumbnail"]')];
    const vids=[...document.querySelectorAll('video')].map(v=>({tid:v.dataset.testid||v.closest('[data-testid]')?.dataset.testid||null,
      w:v.videoWidth,h:v.videoHeight,paused:v.paused,vis:vis(v),rect:Math.round(v.getBoundingClientRect().width)+'x'+Math.round(v.getBoundingClientRect().height)}));
    const btn=document.querySelector('[data-testid="call-controls-screen-share"]');
    return {tracks:tr.length, tracksVis:tr.filter(vis).length,
      thumbs:th.map(t=>({txt:(t.innerText||'').replace(/\s+/g,' ').trim().slice(0,60),vis:vis(t)})),
      videos:vids,
      shareBtn: btn?{l:btn.getAttribute('aria-label'),active:btn.getAttribute('data-active')}:null,
      surfaceText:(document.querySelector('[data-testid="call-surface"]')?.innerText||'').replace(/\s+/g,' ').slice(0,300)};
  });
};
