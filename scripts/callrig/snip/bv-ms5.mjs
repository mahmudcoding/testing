export default async ({page}) => {
  const out = await page.evaluate(()=>{
    const i=[...document.querySelectorAll('input')].find(x=>/Enter a password/i.test(x.placeholder||''))
    if(!i) return {noInput:true}
    let n=i, inert=null, ariaHidden=null
    while(n && n.nodeType===1){ if(n.hasAttribute('inert')&&inert===null) inert=n.tagName+'.'+(n.className||'').slice(0,40)
      if(n.getAttribute('aria-hidden')==='true'&&ariaHidden===null) ariaHidden=n.tagName+'.'+String(n.className||'').slice(0,40); n=n.parentElement }
    i.focus()
    return {inert, ariaHidden, focusedNow: document.activeElement===i,
      activeEl: document.activeElement?.tagName+':'+(document.activeElement?.getAttribute('aria-label')||document.activeElement?.className||'').slice(0,40),
      disabled:i.disabled, readOnly:i.readOnly, rect:(r=>({x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}))(i.getBoundingClientRect()),
      elemAtCentre: (()=>{const r=i.getBoundingClientRect(); const e=document.elementFromPoint(r.x+r.width/2, r.y+r.height/2); return e? e.tagName+'.'+String(e.className||'').slice(0,50):null})(),
      saveButtons:[...document.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0)
        .map(b=>JSON.stringify((b.innerText||'').trim())).filter(t=>/save|discard/i.test(t))}
  })
  return out
}
