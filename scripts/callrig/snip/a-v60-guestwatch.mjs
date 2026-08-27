const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const read = () => page.evaluate((vs)=>{const vis=eval(vs);
    return { t:Date.now()%100000,
      tabs:[...document.querySelectorAll('button,[role="tab"]')].filter(vis).map(b=>(b.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>/Room G|Guest Pass/.test(t)).slice(0,3),
      toasts:[...document.querySelectorAll('[data-sonner-toast],[role="status"],[role="alert"]')].filter(vis).map(t=>(t.innerText||'').replace(/\s+/g,' ').trim().slice(0,80)).filter(Boolean),
      dialogs:[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis).map(d=>(d.innerText||'').replace(/\s+/g,' ').slice(0,120)),
      notices:[...document.body.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/clos|end|return|moved|no longer|main room/i.test(e.innerText||'')).map(e=>e.innerText.replace(/\s+/g,' ').trim().slice(0,60)).slice(0,5),
      mainTxt:(document.querySelector('main')?.innerText||document.body.innerText||'').replace(/\s+/g,' ').slice(0,150) };},VS);
  const samples=[]; 
  for(let i=0;i<70;i++){ samples.push(await read()); await page.waitForTimeout(500); }
  const uniq=(k)=>{const s=new Set(),o=[];for(const x of samples){const v=JSON.stringify(x[k]);if(!s.has(v)){s.add(v);o.push(x[k]);}}return o;};
  return { tabsSeq:uniq('tabs'), toastsSeen:uniq('toasts').filter(a=>a.length), dialogsSeen:uniq('dialogs').filter(a=>a.length),
           noticesSeen:uniq('notices').filter(a=>a.length), finalMain:samples[samples.length-1].mainTxt };
};
