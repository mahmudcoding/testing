export default async ({page}) => {
  return await page.evaluate(()=>{
    const leaf=[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&/password/i.test(e.textContent||''))
    const out={leafTexts:leaf.map(e=>(e.textContent||'').trim().slice(0,70)).slice(0,12)}
    out.pwInputs=[...document.querySelectorAll('input')].filter(i=>/password/i.test(i.type+' '+(i.placeholder||'')+' '+(i.getAttribute('aria-label')||'')))
      .map(i=>({type:i.type, ph:i.placeholder, al:i.getAttribute('aria-label'), len:String(i.value).length}))
    // toggles/switches with password nearby
    const sw=[...document.querySelectorAll('[role=switch],button[aria-checked]')].filter(b=>b.getBoundingClientRect().width>0)
      .map(b=>({t:((b.getAttribute('aria-label')||b.innerText||'').trim()).slice(0,50), checked:b.getAttribute('aria-checked')}))
    out.switches=sw.slice(0,25)
    return out
  })
}
