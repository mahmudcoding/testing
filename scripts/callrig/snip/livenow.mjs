export default async ({page}) => await page.evaluate(()=>{
  const m=document.querySelector('main'); if(!m) return 'no main';
  const t=m.innerText; const i=t.indexOf('Live now');
  return {snippet: t.slice(i, i+220).replace(/\n+/g,' | ')};
});
