export default async ({page}) => {
  const out={}
  out.toggled = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('[role=switch],button[aria-checked]')].filter(x=>x.getBoundingClientRect().width>0)
      .find(x=>/^Password protection$/i.test((x.getAttribute('aria-label')||x.innerText||'').trim()))
    if(b){b.click(); return true} return false
  })
  await page.waitForTimeout(1800)
  out.afterToggle = await page.evaluate(()=>({
    pwInputs:[...document.querySelectorAll('input')].filter(i=>i.type==='password'||/password/i.test((i.placeholder||'')+(i.getAttribute('aria-label')||'')))
      .map(i=>({type:i.type, ph:i.placeholder, al:i.getAttribute('aria-label'), len:String(i.value).length})),
    nearButtons:[...document.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0)
      .map(b=>((b.getAttribute('aria-label')||b.innerText||'').trim())).filter(t=>/password|save|show|hide/i.test(t)).slice(0,10)
  }))
  const pw = await page.$('input[type=password]')
  if(pw){ await pw.click(); await pw.fill('Verify456') }
  out.filled = !!pw
  await page.waitForTimeout(600)
  out.beforeSave = await page.evaluate(()=>{
    const i=[...document.querySelectorAll('input')].find(x=>x.type==='password'||x.type==='text'&&/password/i.test((x.placeholder||'')+(x.getAttribute('aria-label')||'')))
    return {type:i?.type, len:i?String(i.value).length:null, val:i?String(i.value):null}
  })
  out.saved = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0)
      .find(x=>/^Save( changes)?$/i.test((x.innerText||'').trim()))
    if(b&&!b.disabled){b.click(); return (b.innerText||'').trim()} return null
  })
  await page.waitForTimeout(4000)
  out.meeting = await page.evaluate(async()=>{
    try{const r=await fetch('/api/v1/meetings/current',{credentials:'include'});const j=await r.json()
      const m=j?.meeting??j?.data?.meeting??j?.data??j
      return {password_protected:m?.password_protected, requires_approval:m?.requires_approval, hasPasswordField:Object.keys(m||{}).filter(k=>/pass/i.test(k))}
    }catch(e){return {err:String(e).slice(0,80)}}
  })
  return out
}
