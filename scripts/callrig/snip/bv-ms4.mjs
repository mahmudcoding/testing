export default async ({page}) => {
  return await page.evaluate(()=>{
    const vis = el => { const r=el.getBoundingClientRect(); if(r.width===0||r.height===0) return false
      let n=el,op=1; while(n&&n.nodeType===1){const cs=getComputedStyle(n)
        if(cs.display==='none'||cs.visibility==='hidden') return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement}
      return op>0.01 }
    const pwSwitch=[...document.querySelectorAll('[role=switch],button[aria-checked]')]
      .find(x=>/^Password protection$/i.test((x.getAttribute('aria-label')||x.innerText||'').trim()))
    const inputs=[...document.querySelectorAll('input')].map(i=>({type:i.type, ph:i.placeholder, al:i.getAttribute('aria-label'),
      len:String(i.value).length, visible:vis(i), rect:(r=>({x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.w||r.width)}))(i.getBoundingClientRect())}))
    const backdrops=[...document.querySelectorAll('.aloqa-modal-backdrop')].map(b=>({state:b.getAttribute('data-state'), z:getComputedStyle(b).zIndex, visible:vis(b)}))
    const saveBtns=[...document.querySelectorAll('button')].filter(b=>vis(b)&&/save|discard|show password|hide password/i.test((b.innerText||b.getAttribute('aria-label')||'')))
      .map(b=>((b.getAttribute('aria-label')||b.innerText||'').trim()).slice(0,40))
    return {pwChecked:pwSwitch?.getAttribute('aria-checked'), inputs:inputs.filter(i=>i.type==='password'||/password/i.test((i.ph||'')+(i.al||''))), allInputCount:inputs.length, backdrops, saveBtns}
  })
}
