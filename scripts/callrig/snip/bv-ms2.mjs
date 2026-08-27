export default async ({page}) => {
  return await page.evaluate(()=>{
    const leaf=[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&/Password/i.test(e.textContent||''))
    const out={leafTexts:leaf.map(e=>(e.textContent||'').trim().slice(0,60)).slice(0,10)}
    if(leaf.length){
      let box=leaf[0]; for(let i=0;i<8&&box.parentElement;i++) box=box.parentElement
      out.box={text:box.innerText.replace(/\s+/g,' ').slice(0,700),
        controls:[...box.querySelectorAll('button,input,[role=switch]')].filter(b=>b.getBoundingClientRect().width>0)
          .map(b=>({tag:b.tagName, t:((b.getAttribute('aria-label')||b.innerText||'').trim()).slice(0,44),
            type:b.type, checked:b.getAttribute('aria-checked')??b.checked, len:b.value!==undefined?String(b.value).length:undefined}))}
    }
    const panel=[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&/Meeting settings/i.test(e.textContent||''))[0]
    if(panel){ let p=panel; for(let i=0;i<8&&p.parentElement;i++) p=p.parentElement
      out.panelText=p.innerText.replace(/\s+/g,' ').slice(0,900) }
    return out
  })
}
