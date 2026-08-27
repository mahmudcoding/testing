export default async ({page}) => {
  const out={}
  const svState = () => page.evaluate(()=>{
    const sv=[...document.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0).find(b=>/^Save$/i.test((b.innerText||'').trim()))
    const i=[...document.querySelectorAll('input')].find(x=>/Enter a password/i.test(x.placeholder||''))
    return {saveDisabled:sv?sv.disabled:null, pwLen:i?String(i.value).length:null}
  })
  out.s0 = await svState()
  await page.evaluate(()=>{const i=[...document.querySelectorAll('input')].find(x=>/Enter a password/i.test(x.placeholder||'')); if(i) i.focus()})
  await page.keyboard.type('ZZZ',{delay:40})
  await page.waitForTimeout(800)
  out.s1_typed = await svState()
  for(let k=0;k<5;k++) await page.keyboard.press('Backspace')
  await page.waitForTimeout(900)
  out.s2_cleared = await svState()
  if(!(await svState()).saveDisabled){
    out.saved = await page.evaluate(()=>{
      const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0).find(x=>/^Save$/i.test((x.innerText||'').trim()))
      if(b&&!b.disabled){b.click(); return 'clicked'} return 'disabled'
    })
    await page.waitForTimeout(4500)
  } else out.saved='save stayed disabled with empty field'
  out.meeting = await page.evaluate(async()=>{
    try{const r=await fetch('/api/v1/meetings/current',{credentials:'include'});const j=await r.json()
      const m=j?.meeting??j?.data?.meeting??j?.data??j
      return {password_protected:m?.password_protected}
    }catch(e){return {err:String(e).slice(0,60)}}
  })
  return out
}
