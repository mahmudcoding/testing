export default async ({page}) => {
  const out={}
  out.before = await page.evaluate(()=>{
    const i=[...document.querySelectorAll('input')].find(x=>/Enter a password/i.test(x.placeholder||''))
    const sw=[...document.querySelectorAll('[role=switch],button[aria-checked]')].find(x=>/^Password protection$/i.test((x.getAttribute('aria-label')||x.innerText||'').trim()))
    return {len:i?String(i.value).length:null, pwChecked:sw?.getAttribute('aria-checked')}
  })
  out.saveClicked = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0)
      .find(x=>/^Save$/i.test((x.innerText||'').trim()))
    if(!b) return 'no-save-button'
    if(b.disabled) return 'disabled'
    b.click(); return 'clicked'
  })
  await page.waitForTimeout(4500)
  out.err = await page.evaluate(()=>{
    const t=document.body.innerText
    const m=t.match(/(error|required|cannot be empty|invalid)[^\n]{0,60}/i)
    return m? m[0].slice(0,80): null
  })
  out.meeting = await page.evaluate(async()=>{
    try{const r=await fetch('/api/v1/meetings/current',{credentials:'include'});const j=await r.json()
      const m=j?.meeting??j?.data?.meeting??j?.data??j
      return {password_protected:m?.password_protected}
    }catch(e){return {err:String(e).slice(0,80)}}
  })
  return out
}
