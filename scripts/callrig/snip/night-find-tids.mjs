export default async ({page}) => page.evaluate((pat)=>{
  const re=new RegExp(pat,'i');
  return [...document.querySelectorAll('[data-testid]')]
    .map(e=>e.getAttribute('data-testid')).filter(t=>re.test(t))
    .filter((v,i,a)=>a.indexOf(v)===i).slice(0,20);
}, process.env.QA_PAT||'room');
