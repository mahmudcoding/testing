const VIS = `(e)=>{ if(!e) return null; const r=e.getBoundingClientRect();
  let o=1,n=e; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
    o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden') return {vis:false,why:'hidden'}; n=n.parentElement;}
  const hit=document.elementFromPoint(Math.round(r.left+r.width/2),Math.round(r.top+r.height/2));
  return {vis: r.width>3&&r.height>3&&o>0.05, opacity:+o.toFixed(3),
    rect:[Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)],
    hitSelf: !!(hit&&(hit===e||e.contains(hit)))};}`;
export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const probe=()=>page.evaluate((VIS)=>{
    const vis=eval(VIS);
    const m=document.querySelector('main');
    const btns=[...m.querySelectorAll('button,[role="button"]')];
    const sb=btns.find(b=>/scroll|latest|bottom|вниз/i.test((b.getAttribute('aria-label')||'')+' '+(b.innerText||'')));
    // scroll container: nearest scrollable ancestor of a message
    const msg=document.querySelector('main [data-message-id]');
    let sc=msg; while(sc && !(sc.scrollHeight>sc.clientHeight+20 && /auto|scroll/.test(getComputedStyle(sc).overflowY))) sc=sc.parentElement;
    const atBottom = sc? (sc.scrollHeight - sc.scrollTop - sc.clientHeight) : null;
    const els=[...document.querySelectorAll('main [data-message-id]')];
    const lastEl=els[els.length-1];
    const lr=lastEl?lastEl.getBoundingClientRect():null;
    return {button: sb? {al:sb.getAttribute('aria-label'), ...vis(sb)} : null,
      distFromBottomPx: atBottom===null?null:Math.round(atBottom),
      lastMsgFullyVisible: lr? (lr.top>=0 && lr.bottom<=innerHeight+2) : null,
      loaded: els.length};
  }, VIS);
  const out={};
  out.onOpen=await probe();
  // scroll up until the button shows
  const box=await page.locator('main').boundingBox();
  await page.mouse.move(Math.round(box.x+box.width/2), Math.round(box.y+box.height/2));
  for(let i=0;i<10;i++){ await page.mouse.wheel(0,-1200); await page.waitForTimeout(300); }
  await page.waitForTimeout(1200);
  out.afterScrollUp=await probe();
  // (a) scroll back down manually to the very bottom
  for(let i=0;i<40;i++){ await page.mouse.wheel(0,1600); await page.waitForTimeout(160); }
  await page.waitForTimeout(2500);
  out.afterScrollDown=await probe();
  // (b) send a message from the composer
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  for(let i=0;i<6;i++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(200); }
  await comp.type('QA-S2-BOTTOM', {delay:40}); await page.waitForTimeout(400);
  await page.keyboard.press('Enter'); await page.waitForTimeout(4000);
  out.afterSend=await probe();
  return out;
};
