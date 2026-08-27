const LINK='https://airion-cargo.store/join/ed5a531ac71e3aeb723862fba0de9e5cef0174836a0df6328edc30ecba2bba7c';
const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page, ctx }) => {
  const out={};
  await ctx.clearCookies();
  await page.goto('https://airion-cargo.store/',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(2000);
  await page.evaluate(()=>{ try{localStorage.clear();sessionStorage.clear();}catch(e){} });
  out.anon = await page.evaluate(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});return r.status;});
  await page.goto(LINK,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/guest-landing.png'});
  out.landing = await page.evaluate((vs)=>{const vis=eval(vs);
    return { url:location.pathname.slice(0,50),
      txt:(document.querySelector('main')?.innerText||document.body.innerText||'').replace(/\s+/g,' ').slice(0,300),
      inputs:[...document.querySelectorAll('input')].filter(vis).map(i=>({ph:(i.placeholder||'').slice(0,28),type:i.type})),
      btns:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ').slice(0,26)).filter(Boolean).slice(0,12) };},VS);
  return out;
};
