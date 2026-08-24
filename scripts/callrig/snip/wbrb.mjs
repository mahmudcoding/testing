export default async ({page}) => {
  const st = async () => await page.evaluate(()=>{
    const btns=[...document.querySelectorAll('button')].map(b=>b.getAttribute('aria-label')).filter(Boolean);
    const cam=btns.find(l=>/^Turn camera/.test(l));
    const wb=btns.find(l=>/Will be right back|I'm back/.test(l));
    const tile=[...document.querySelectorAll('[data-testid="participant-tile"]')].find(t=>/\(you\)/.test(t.innerText));
    return {cam, wbrb: wb, marks: tile? [...tile.querySelectorAll('[aria-label]')].map(e=>e.getAttribute('aria-label')).slice(0,6):[]};
  });
  const out=[];
  out.push(['start (camera off)', await st()]);
  const click = async (lbl)=>{ const b=await page.$(`button[aria-label="${lbl}"]`); if(b){ await b.click(); await page.waitForTimeout(3500); return true;} return false; };
  out.push(['clicked WBRB: '+await click('Will be right back'), await st()]);
  out.push(["clicked I'm back: "+await click("I'm back"), await st()]);
  return out;
};
