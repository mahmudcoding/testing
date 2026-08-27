export default async ({page}) => {
  return await page.evaluate(()=>{
    const tb=document.querySelector('[data-testid="call-toolbar"]');
    const btns=[...tb.querySelectorAll('button')];
    const more=btns.find(b=>(b.getAttribute('aria-label')||'')==='More');
    if(!more) return {none:true, labels:btns.map(b=>b.getAttribute('aria-label'))};
    const r=more.getBoundingClientRect(); const st=getComputedStyle(more);
    return {
      label: more.getAttribute('aria-label'),
      tabIndex: more.tabIndex,
      tabIndexAttr: more.getAttribute('tabindex'),
      disabled: more.disabled,
      ariaHidden: more.getAttribute('aria-hidden'),
      inert: more.hasAttribute('inert') || !!more.closest('[inert]'),
      visible: r.width>0&&r.height>0,
      rect:{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)},
      display: st.display, visibility: st.visibility, opacity: st.opacity,
      parentAriaHidden: (p=>{let n=more.parentElement;for(let i=0;i<6&&n;i++,n=n.parentElement){if(n.getAttribute('aria-hidden')) return n.getAttribute('aria-hidden');}return null;})(),
      // is it inside the viewport / on top?
      hitTest: (()=>{const e=document.elementFromPoint(Math.round(r.x+r.width/2), Math.round(r.y+r.height/2)); return e? (e===more? 'itself' : (e.getAttribute('aria-label')||e.tagName)) : 'none';})()
    };
  });
};
