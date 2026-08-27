export default async ({page}) => page.evaluate(()=>{
  const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
  const d=[...document.querySelectorAll('[role="dialog"]')].find(x=>x.getBoundingClientRect().height>30);
  if(!d) return 'no dialog';
  return {btns:[...d.querySelectorAll('button')].filter(vis)
      .map(b=>({l:b.getAttribute('aria-label')||(b.textContent||'').trim().slice(0,26),
        disabled:b.disabled, y:Math.round(b.getBoundingClientRect().y)})).slice(0,20),
    inputs:[...d.querySelectorAll('input')].filter(vis).map(i=>({ph:i.getAttribute('placeholder'), type:i.type})),
    txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,260)};
});
