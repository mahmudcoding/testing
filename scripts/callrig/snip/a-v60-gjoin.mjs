const LINK='https://airion-cargo.store/join/9d966efc7d4c7f471d52d744fa9a178aa99c159036af61516a5ee9401f154ab5';
const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page, ctx }) => {
  const out={};
  await ctx.clearCookies();
  await page.goto('https://airion-cargo.store/',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(1500);
  await page.evaluate(()=>{try{localStorage.clear();sessionStorage.clear();}catch(e){}});
  await page.goto(LINK,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const i=await page.$('input[placeholder="Ada Lovelace"]');
  if(!i){ out.noNameField=true;
    out.txt=await page.evaluate(()=>document.body.innerText.replace(/\s+/g,' ').slice(0,140)); return out; }
  const nm='Visitor '+Math.floor(Math.random()*900+100);
  await i.click(); await page.keyboard.type(nm,{delay:25});
  out.name=nm;
  await page.waitForTimeout(600);
  await page.locator('button',{hasText:/^Ask to join$/}).first().click();
  await page.waitForTimeout(6000);
  out.state = await page.evaluate(()=>document.body.innerText.replace(/\s+/g,' ').slice(0,110));
  return out;
};
