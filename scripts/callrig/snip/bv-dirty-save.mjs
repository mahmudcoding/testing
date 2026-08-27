export default async ({page}) => {
  const click = re => page.evaluate(r=>{
    const b=[...document.querySelectorAll('button,[role=switch]')].filter(x=>x.getBoundingClientRect().width>0)
      .find(x=>new RegExp(r,'i').test((x.getAttribute('aria-label')||x.innerText||'').trim()))
    if(b&&!b.disabled){b.click(); return (b.getAttribute('aria-label')||b.innerText||'').trim()} return null
  }, re)
  const out={}
  out.opened = await click('^Meeting settings$')
  await page.waitForTimeout(3000)
  out.before = await page.evaluate(()=>{
    const i=[...document.querySelectorAll('input')].find(x=>/Enter a password/i.test(x.placeholder||''))
    const sw=[...document.querySelectorAll('[role=switch],button[aria-checked]')].find(x=>/^Mute participants on entry$/i.test((x.getAttribute('aria-label')||x.innerText||'').trim()))
    const sv=[...document.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0).find(b=>/^Save$/i.test((b.innerText||'').trim()))
    return {pwLen:i?String(i.value).length:null, muteChecked:sw?.getAttribute('aria-checked'), saveDisabled:sv?sv.disabled:null}
  })
  out.dirtied = await click('^Mute participants on entry$')
  await page.waitForTimeout(1500)
  out.afterDirty = await page.evaluate(()=>{
    const i=[...document.querySelectorAll('input')].find(x=>/Enter a password/i.test(x.placeholder||''))
    const sv=[...document.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0).find(b=>/^Save$/i.test((b.innerText||'').trim()))
    return {pwLen:i?String(i.value).length:null, saveDisabled:sv?sv.disabled:null}
  })
  out.saved = await click('^Save$')
  await page.waitForTimeout(5000)
  out.meeting = await page.evaluate(async()=>{
    try{const r=await fetch('/api/v1/meetings/current',{credentials:'include'});const j=await r.json()
      const m=j?.meeting??j?.data?.meeting??j?.data??j
      return {password_protected:m?.password_protected, requires_approval:m?.requires_approval}
    }catch(e){return {err:String(e).slice(0,80)}}
  })
  return out
}
