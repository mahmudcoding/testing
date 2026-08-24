export default async ({page}) => await page.evaluate(() => ({
  url: location.href,
  title: document.title,
  body: document.body.innerText.replace(/\n+/g,' | ').slice(0,800),
  btns: [...document.querySelectorAll('button,a')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim()).filter(Boolean).slice(0,25)
}));
