export default async ({page}) => page.evaluate(()=>{
  const ms=[...document.querySelectorAll('[role="dialog"],aside')];
  const m=ms[ms.length-1];
  if(!m) return {none:true};
  return {text:m.innerText.replace(/\n+/g,' | ').slice(0,220),
    buttons:[...m.querySelectorAll('button')].map(b=>({
      l:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,24),
      disabled:b.disabled, title:b.getAttribute('title'), tid:b.getAttribute('data-testid')}))};
});
