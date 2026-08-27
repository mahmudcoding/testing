const click = (re) => `(() => {
  const b=[...document.querySelectorAll('button,[role=switch]')].filter(x=>x.getBoundingClientRect().width>0)
    .find(x=>${re}.test((x.getAttribute('aria-label')||x.innerText||'').trim()))
  if(b&&!b.disabled){b.click(); return (b.getAttribute('aria-label')||b.innerText||'').trim()} return null })()`
const readPw = () => `(() => {
  const i=[...document.querySelectorAll('input')].find(x=>/Enter a password/i.test(x.placeholder||'')||x.type==='password')
  if(!i) return {noInput:true}
  const sw=[...document.querySelectorAll('[role=switch],button[aria-checked]')].find(x=>/^Password protection$/i.test((x.getAttribute('aria-label')||x.innerText||'').trim()))
  return {pwChecked:sw?.getAttribute('aria-checked'), type:i.type, len:String(i.value).length, val:String(i.value),
    placeholder:i.placeholder,
    revealBtn:[...document.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0)
      .map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim()).filter(t=>/show password|hide password/i.test(t))} })()`
export default async ({page, mode}) => {
  const out={mode: process.env.QA_MODE||'reopen'}
  if(out.mode==='reload'){
    await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/call/V4OWDKLUJ7XE1PZ',{waitUntil:'domcontentloaded'})
    await page.waitForTimeout(9000)
  } else {
    out.closed = await page.evaluate(click('/^Close$/i'))
    await page.waitForTimeout(2000)
  }
  out.opened = await page.evaluate(click('/^Meeting settings$/i'))
  await page.waitForTimeout(3500)
  out.beforeReveal = await page.evaluate(readPw())
  out.revealClicked = await page.evaluate(click('/^Show password$/i'))
  await page.waitForTimeout(1500)
  out.afterReveal = await page.evaluate(readPw())
  out.meeting = await page.evaluate(async()=>{
    try{const r=await fetch('/api/v1/meetings/current',{credentials:'include'});const j=await r.json()
      const m=j?.meeting??j?.data?.meeting??j?.data??j
      return {password_protected:m?.password_protected, keysWithPass:Object.keys(m||{}).filter(k=>/pass/i.test(k))}
    }catch(e){return {err:String(e).slice(0,80)}}
  })
  return out
}
