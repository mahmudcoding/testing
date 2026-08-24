export default async ({page}) => await page.evaluate(()=>({
  url: location.href,
  main: (document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,900),
  media: [...document.querySelectorAll('video,audio')].map(v=>({tag:v.tagName, src:(v.currentSrc||v.src||'').slice(0,110), dur:v.duration})),
  btns: [...document.querySelectorAll('button,a')].map(b=>`${(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,26)}#${b.getAttribute('data-testid')||'-'}`).filter(x=>!x.startsWith('#')).slice(-25)
}));
