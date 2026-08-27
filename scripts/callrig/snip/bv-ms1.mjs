export default async ({page}) => {
  const out={}
  out.opened = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0)
      .find(x=>/^Meeting settings$/i.test((x.getAttribute('aria-label')||x.innerText||'').trim()))
    if(b){b.click(); return true} return false
  })
  await page.waitForTimeout(3000)
  out.dlg = await page.evaluate(()=>{
    const ds=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0)
    const d=ds.find(x=>/Meeting settings|Password/i.test(x.innerText)) || ds[ds.length-1]
    if(!d) return null
    return {text:d.innerText.replace(/\s+/g,' ').slice(0,900),
      buttons:[...d.querySelectorAll('button,[role=switch],[role=checkbox]')].filter(b=>b.getBoundingClientRect().width>0)
        .map(b=>({t:((b.getAttribute('aria-label')||b.innerText||'').trim()).slice(0,44), checked:b.getAttribute('aria-checked'), role:b.getAttribute('role')})),
      inputs:[...d.querySelectorAll('input,textarea')].map(i=>({t:i.type, al:i.getAttribute('aria-label'), ph:i.placeholder, len:String(i.value).length, checked:i.checked}))}
  })
  return out
}
