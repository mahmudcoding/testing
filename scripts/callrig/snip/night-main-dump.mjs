export default async ({page}) => page.evaluate(()=>{
  const m=document.querySelector('main')||document.body;
  return {text:m.innerText.replace(/\n+/g,' | ').slice(0,700),
    buttons:[...m.querySelectorAll('button')].map(b=>({
      l:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,26), d:b.disabled})).slice(0,25)};
});
