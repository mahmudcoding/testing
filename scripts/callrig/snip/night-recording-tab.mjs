export default async ({page}) => page.evaluate(()=>{
  const m=document.querySelector('main')||document.body;
  return {text:m.innerText.replace(/\n+/g,' | ').slice(0,320),
    media:[...document.querySelectorAll('video,audio')].map(v=>({tag:v.tagName.toLowerCase(),
      src:(v.currentSrc||v.src||'').slice(0,70), dur:v.duration, ready:v.readyState,
      err:v.error?v.error.code:null, paused:v.paused})),
    buttons:[...m.querySelectorAll('button,a')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,26)).filter(Boolean).slice(0,14)};
});
