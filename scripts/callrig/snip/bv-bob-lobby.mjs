const SEL='button,a,[role=button],[role=link],input,select,summary,textarea,[tabindex]:not([tabindex="-1"])'
export default async ({page}) => {
  const out={}
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/call/V4OWDKLUJ7XE1PZ',{waitUntil:'domcontentloaded'})
  await page.waitForTimeout(7000)
  const snap = () => page.evaluate((SEL)=>{
    const vis = el => { const r=el.getBoundingClientRect(); if(r.width===0||r.height===0) return false
      let n=el,op=1; while(n&&n.nodeType===1){const cs=getComputedStyle(n)
        if(cs.display==='none'||cs.visibility==='hidden') return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement}
      return op>0.01 }
    const els=[...document.querySelectorAll(SEL)]
    return {txt:document.body.innerText.replace(/\s+/g,' ').slice(0,220), total:els.length,
      visible:els.filter(vis).map(e=>((e.getAttribute('aria-label')||e.innerText||e.placeholder||'').trim()||e.tagName+':'+e.type).slice(0,40))}
  }, SEL)
  out.preJoin = await snap()
  // click through the pre-join device check if present
  const j = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0)
      .find(x=>/^(Join|Join call|Ask to join|Request to join|Continue)$/i.test((x.innerText||'').trim()))
    if(b&&!b.disabled){b.click(); return (b.innerText||'').trim()} return null
  })
  out.clicked = j
  await page.waitForTimeout(6000)
  out.waiting = await snap()
  return out
}
