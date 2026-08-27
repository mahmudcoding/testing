export default async ({page}) => page.evaluate(()=>{
  const m=document.querySelector('main')||document.body;
  const t=m.innerText.replace(/\n+/g,' | ');
  const i=t.indexOf('Block');
  return {around: t.slice(Math.max(0,i-320), i+520)};
});
