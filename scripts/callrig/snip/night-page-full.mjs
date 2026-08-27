export default async ({page}) => await page.evaluate(()=>({
  url: location.href,
  bodyText:(document.body.innerText||'').replace(/\n+/g,' | ').slice(0,300),
  buttons:[...document.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim()).filter(Boolean),
  links:[...document.querySelectorAll('a')].map(a=>({t:(a.textContent||'').trim().slice(0,30), href:(a.getAttribute('href')||'').slice(0,40)})).filter(x=>x.t),
  bodyLen:(document.body.innerText||'').length
}));
