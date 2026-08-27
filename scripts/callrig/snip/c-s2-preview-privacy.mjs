const WS='W4QCF1XTURESO01', DM='C4OVEWOTJW1AA86';
export default async ({page}) => {
  const out={};
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/C4QCGENERAL0001`,{waitUntil:'load'});
  await page.waitForTimeout(7500);
  // 1) Preview from the DM sidebar card menu
  const row = page.locator(`a[href*="/d/${DM}"]`).first();
  await row.click({button:'right'}).catch(()=>{});
  await page.waitForTimeout(1400);
  await page.locator('[role="menu"] button, [data-radix-popper-content-wrapper] button').filter({hasText:/^Preview$/}).last().click({timeout:8000});
  await page.waitForTimeout(2500);
  out.preview = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
      let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    return {url:location.href, dialog: d? {text:d.innerText.replace(/\n+/g,' | ').slice(0,220),
        buttons:[...d.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,24)).filter(Boolean)}:null,
      composer: !!document.querySelector('div[contenteditable="true"][aria-label="Compose message"]'),
      msgs:document.querySelectorAll('[data-message-id]').length};
  });
  await page.keyboard.press('Escape'); await page.waitForTimeout(900);
  // 2) DM privacy gate: is the company-only user reachable at all?
  await page.goto(`https://airion-cargo.store/w/${WS}/directories?tab=people`,{waitUntil:'load'});
  await page.waitForTimeout(6500);
  out.people = await page.evaluate(async (ws)=>{
    const main=document.querySelector('main')||document.body;
    const r=await fetch(`/api/v1/workspaces/${ws}/members`,{credentials:'include'});
    let j=null; try{ j=await r.json(); }catch(e){}
    const list=(j&&(j.members||j.data))||[];
    return {listedOnPage:(main.innerText.match(/QA [A-Za-z]+/g)||[]),
      apiCount:Array.isArray(list)?list.length:null,
      apiNames:Array.isArray(list)?list.map(m=>(m.user&&m.user.display_name)||m.user_id).slice(0,10):null};
  }, WS);
  return out;
};
