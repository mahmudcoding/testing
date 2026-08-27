const SEL='button,a,[role=button],[role=link],input,select,summary,textarea,[tabindex]:not([tabindex="-1"])'
export default async ({page}) => {
  const vis = `el => { const r=el.getBoundingClientRect(); if(r.width===0||r.height===0) return false
      let n=el,op=1; while(n&&n.nodeType===1){const cs=getComputedStyle(n)
        if(cs.display==='none'||cs.visibility==='hidden') return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement}
      return op>0.01 }`
  return await page.evaluate(([SEL,visSrc])=>{
    const vis=eval(visSrc)
    const els=[...document.querySelectorAll(SEL)]
    return {url:location.href.slice(0,110), vis:document.visibilityState,
      txt:document.body.innerText.replace(/\s+/g,' ').slice(0,260),
      total:els.length,
      visible:els.filter(vis).map(e=>((e.getAttribute('aria-label')||e.innerText||e.placeholder||'').trim()||e.tagName+':'+e.type).slice(0,38)),
      hidden:els.filter(e=>!vis(e)).map(e=>((e.getAttribute('aria-label')||e.innerText||e.placeholder||'').trim()||e.tagName+':'+e.type).slice(0,38))}
  }, [SEL, vis])
}
