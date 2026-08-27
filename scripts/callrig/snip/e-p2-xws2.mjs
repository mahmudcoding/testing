import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  out.stillParkedAt = page.url().replace(/^https:\/\/[^/]+/,'');   // NO navigation
  await page.waitForTimeout(5000);
  out.unreadApiWs1 = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/workspaces/${WS}/unread',{credentials:'include'});
    const j=await r.json().catch(()=>({})); const a=j.unread_counts||[];
    return a.filter(c=>c.channel_id==='C4QEGENERAL0001').map(c=>'unread='+c.unread_count+' lastMsg='+c.last_message_seq+' lastRead='+c.last_read_seq)[0]; })()`);
  out.visibleChrome = await page.evaluate(`(() => { ${VISFN}
    return { rail: [...document.querySelectorAll('button')].filter(b=>vis(b)&&b.getBoundingClientRect().left<62)
        .map(b=>(b.getAttribute('aria-label')||'')+(/\\d/.test(b.innerText||'')?' badge='+(b.innerText||'').replace(/\\s+/g,''):'')).join(' | ').slice(0,300),
      wsButton: (()=>{const b=[...document.querySelectorAll('button')].find(b=>vis(b)&&/workspace menu/i.test(b.getAttribute('aria-label')||''));
        return b? (b.parentElement?.innerText||'').replace(/\\n+/g,'/').slice(0,40):null;})(),
      anyDigitBadgeInChrome: [...document.querySelectorAll('nav *,header *')].filter(n=>n.children.length===0&&/^\\d+$/.test((n.textContent||'').trim())).map(n=>n.textContent.trim()) }; })()`);
  // now open the switcher, still without navigating
  await page.locator('button[aria-label="Open workspace menu"]').first().click();
  await page.waitForTimeout(2500);
  out.switcher = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const boxes=[...document.querySelectorAll('[role=menu],[role=dialog],[data-radix-popper-content-wrapper]')].filter(boxVis);
    const p=boxes[boxes.length-1]; if(!p) return 'no menu';
    return {text:(p.innerText||'').replace(/\\n+/g,' | ').slice(0,220),
      digits: [...p.querySelectorAll('*')].filter(n=>n.children.length===0&&/^\\d+$/.test((n.textContent||'').trim())).map(n=>n.textContent.trim()),
      dots: [...p.querySelectorAll('span,div')].filter(n=>/rounded-full/.test(String(n.className||''))&&/bg-(red|accent|green)/.test(String(n.className||''))).length}; })()`);
  return out;
};
