export default async ({page}) => {
  const out={}
  out.focused = await page.evaluate(()=>{
    const i=[...document.querySelectorAll('input')].find(x=>x.type==='password'&&x.getBoundingClientRect().width>0)
    if(!i) return false
    i.focus(); return document.activeElement===i
  })
  await page.keyboard.type('Verify456', {delay:40})
  await page.waitForTimeout(700)
  out.typed = await page.evaluate(()=>{
    const i=[...document.querySelectorAll('input')].find(x=>(x.type==='password'||x.type==='text')&&/Enter a password/i.test(x.placeholder||''))
    return {type:i?.type, len:i?String(i.value).length:null, val:i?String(i.value):null}
  })
  out.savedLabel = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0)
      .find(x=>/^Save( changes)?$/i.test((x.innerText||'').trim()))
    if(b&&!b.disabled){b.click(); return (b.innerText||'').trim()} return null
  })
  await page.waitForTimeout(4500)
  out.meeting = await page.evaluate(async()=>{
    try{const r=await fetch('/api/v1/meetings/current',{credentials:'include'});const j=await r.json()
      const m=j?.meeting??j?.data?.meeting??j?.data??j
      return {password_protected:m?.password_protected, requires_approval:m?.requires_approval,
        passKeys:Object.keys(m||{}).filter(k=>/pass/i.test(k)).map(k=>k+'='+JSON.stringify(m[k]))}
    }catch(e){return {err:String(e).slice(0,80)}}
  })
  return out
}
