export default async ({page}) => page.evaluate(()=>{
  const ms=[...document.querySelectorAll('[role="dialog"]')];
  const m=ms[ms.length-1]; if(!m) return {none:true};
  return {text:m.innerText.replace(/\n+/g,' | ').slice(0,700),
    rows:[...m.querySelectorAll('[role="option"],li,label')].map(e=>({
      t:(e.innerText||'').replace(/\n+/g,' ').trim().slice(0,40),
      dis:e.getAttribute('aria-disabled'), sel:e.getAttribute('aria-selected')})).slice(0,14)};
});
