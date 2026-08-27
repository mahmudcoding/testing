export default async ({page}) => {
  return await page.evaluate(()=>{
    const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>3&&q.height>3;};
    const btns=[...r.querySelectorAll('button')].filter(vis)
      .filter(b=>b.getAttribute('data-testid')||/^(Mute|Unmute|Turn camera|Raise hand|Share screen|Stop sharing)/i.test(b.getAttribute('aria-label')||''))
      .map(b=>(b.getAttribute('aria-label')||(b.textContent||'').trim().slice(0,20))
        +(b.disabled?' [disabled]':'')
        +(b.getAttribute('data-testid')?' {'+b.getAttribute('data-testid')+'}':''));
    const share=[...r.querySelectorAll('button')].find(b=>b.getAttribute('data-testid')==='call-controls-screen-share');
    return {shareBtn: share?{aria:share.getAttribute('aria-label'), disabled:share.disabled, visible:vis(share)}:'ABSENT',
      toolbar:btns.slice(0,24)};
  });
};
