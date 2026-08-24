export default async ({page}) => await page.evaluate(()=>{
  const heads=[...document.querySelectorAll('main h2')];
  const h=heads.find(x=>/Live now/i.test(x.textContent));
  if(!h) return 'no live now';
  let sec=h.closest('section')||h.parentElement.parentElement;
  const card = sec.querySelector('li,[class*="card" i]')||sec;
  return {sectionText: sec.innerText.replace(/\n+/g,' | ').slice(0,300),
          avatars: [...sec.querySelectorAll('img,[aria-label]')].map(e=>e.getAttribute('aria-label')||e.getAttribute('alt')||e.textContent.trim().slice(0,12)).filter(Boolean).slice(0,12)};
});
