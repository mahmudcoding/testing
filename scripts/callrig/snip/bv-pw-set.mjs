const clickByLabel = (re) => `(() => {
  const b=[...document.querySelectorAll('button,[role=switch]')].filter(x=>x.getBoundingClientRect().width>0)
    .find(x=>${re}.test((x.getAttribute('aria-label')||x.innerText||'').trim()))
  if(b&&!b.disabled){b.click(); return (b.getAttribute('aria-label')||b.innerText||'').trim()} return null })()`
export default async ({page}) => {
  const out={}
  out.openedMS = await page.evaluate(clickByLabel('/^Meeting settings$/i'))
  await page.waitForTimeout(3000)
  out.state0 = await page.evaluate(()=>{
    const sw=[...document.querySelectorAll('[role=switch],button[aria-checked]')].find(x=>/^Password protection$/i.test((x.getAttribute('aria-label')||x.innerText||'').trim()))
    const i=[...document.querySelectorAll('input')].find(x=>/Enter a password/i.test(x.placeholder||''))
    return {pwChecked:sw?.getAttribute('aria-checked'), hasInput:!!i,
      backdrops:[...document.querySelectorAll('.aloqa-modal-backdrop')].length}
  })
  if(out.state0.pwChecked!=='true'){
    out.toggled = await page.evaluate(clickByLabel('/^Password protection$/i'))
    await page.waitForTimeout(2000)
  }
  out.state1 = await page.evaluate(()=>{
    const i=[...document.querySelectorAll('input')].find(x=>/Enter a password/i.test(x.placeholder||''))
    if(!i) return {noInput:true}
    i.focus()
    const r=i.getBoundingClientRect()
    return {focused:document.activeElement===i, type:i.type,
      elemAtCentre:(e=>e?e.tagName+'.'+String(e.className||'').slice(0,40):null)(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))}
  })
  await page.keyboard.type('Verify456',{delay:45})
  await page.waitForTimeout(800)
  out.typed = await page.evaluate(()=>{
    const i=[...document.querySelectorAll('input')].find(x=>/Enter a password/i.test(x.placeholder||''))
    return {type:i?.type, len:i?String(i.value).length:null}
  })
  out.saveClicked = await page.evaluate(clickByLabel('/^Save$/i'))
  await page.waitForTimeout(5000)
  out.meeting = await page.evaluate(async()=>{
    try{const r=await fetch('/api/v1/meetings/current',{credentials:'include'});const j=await r.json()
      const m=j?.meeting??j?.data?.meeting??j?.data??j
      return {password_protected:m?.password_protected, requires_approval:m?.requires_approval}
    }catch(e){return {err:String(e).slice(0,80)}}
  })
  return out
}
