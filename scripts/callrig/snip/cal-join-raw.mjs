export default async ({ctx}) => {
  const p = await ctx.newPage();
  await p.goto('https://airion-cargo.store/calendar/join/0cbc9b4cbb6ac92a872706e930d4ca322759972673ccd233b514b8572c5a12b5',{waitUntil:'domcontentloaded'});
  await p.waitForTimeout(3000);
  const r = await p.evaluate(async () => {
    const res = await fetch('/api/v1/calendar/join',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:'0cbc9b4cbb6ac92a872706e930d4ca322759972673ccd233b514b8572c5a12b5',name:'Early Guest'})});
    return {status:res.status, body:(await res.text()).slice(0,1100)};
  });
  const dom = await p.evaluate(()=>({html: document.body.innerHTML.length, text: document.body.innerText.replace(/\n+/g,' | ').slice(0,300), nodes: document.querySelectorAll('body *').length}));
  await p.close();
  return {r, dom};
};
