const SEL='button,a,[role=button],[role=link],input,select,summary,textarea,[tabindex]:not([tabindex="-1"])'
export default async ({page}) => {
  const out={}
  const snap = () => page.evaluate((SEL)=>{
    const vis=el=>{const r=el.getBoundingClientRect(); if(r.width===0||r.height===0) return false
      let n=el,op=1; while(n&&n.nodeType===1){const cs=getComputedStyle(n)
        if(cs.display==='none'||cs.visibility==='hidden') return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement}
      return op>0.01}
    const els=[...document.querySelectorAll(SEL)]
    return {txt:document.body.innerText.replace(/\s+/g,' ').slice(0,200), total:els.length,
      visible:els.filter(vis).map(e=>((e.getAttribute('aria-label')||e.innerText||e.placeholder||'').trim()||e.tagName+':'+e.type).slice(0,40)),
      hidden:els.filter(e=>!vis(e)).map(e=>((e.getAttribute('aria-label')||e.innerText||e.placeholder||'').trim()||e.tagName+':'+e.type).slice(0,40))}
  }, SEL)
  out.start = await snap()
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0)
    .find(x=>/^Request to join again$/i.test((x.innerText||'').trim())); if(b) b.click()})
  await page.waitForTimeout(6000)
  out.afterAgain = await snap()
  // if a password field appeared, try a wrong password first
  const pw = await page.evaluate(()=>!![...document.querySelectorAll('input')].find(x=>x.type==='password'))
  out.passwordAsked = pw
  if(pw){
    await page.evaluate(()=>{const i=[...document.querySelectorAll('input')].find(x=>x.type==='password'); if(i) i.focus()})
    await page.keyboard.type('WrongPass1',{delay:35})
    await page.waitForTimeout(500)
    await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0)
      .find(x=>/^(Continue|Ask to join|Join)$/i.test((x.innerText||'').trim())); if(b&&!b.disabled) b.click()})
    await page.waitForTimeout(5000)
    out.afterWrong = await snap()
    await page.evaluate(()=>{const i=[...document.querySelectorAll('input')].find(x=>x.type==='password'); if(i){i.focus(); i.select()}})
    await page.keyboard.press('Meta+A'); await page.keyboard.type('Verify456',{delay:35})
    await page.waitForTimeout(500)
    out.pwFieldNow = await page.evaluate(()=>{const i=[...document.querySelectorAll('input')].find(x=>x.type==='password'); return i?String(i.value).length:null})
    await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0)
      .find(x=>/^(Continue|Ask to join|Join)$/i.test((x.innerText||'').trim())); if(b&&!b.disabled) b.click()})
    await page.waitForTimeout(7000)
    out.afterRight = await snap()
  }
  return out
}
