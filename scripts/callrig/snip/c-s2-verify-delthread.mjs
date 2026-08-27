export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  // parent + 3 replies
  const setup=await page.evaluate(async(ch)=>{
    const post=async(body,parent)=>{
      const b={channel_id:ch, body, idempotency_key:'qdt-'+Math.random().toString(36).slice(2)};
      if(parent) b.thread_parent_id=parent;
      const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
        headers:{'content-type':'application/json'}, body:JSON.stringify(b)});
      return r.ok? (await r.json()).id : null;};
    const p=await post('QA-V2-DT parent');
    const reps=[];
    for(let i=1;i<=3;i++) reps.push(await post(`QA-V2-DT reply ${i}`, p));
    return {parent:p, replies:reps};}, ch);
  out.setup=setup;
  await page.waitForTimeout(3000);
  out.threadBefore=await page.evaluate(async(p)=>{
    const r=await fetch(`/api/v1/messaging/messages/${p}/thread?limit=10`,{credentials:'include'});
    const j=await r.json().catch(()=>({}));
    return {status:r.status, replies:(j.replies||[]).length};}, setup.parent);
  // delete the parent
  out.delete=await page.evaluate(async({ch,p})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages`,{method:'DELETE',credentials:'include',
      headers:{'content-type':'application/json'}, body:JSON.stringify({message_ids:[p]})});
    return {status:r.status, body:(await r.text()).slice(0,90)};},{ch,p:setup.parent});
  await page.waitForTimeout(4000);
  out.threadAfter=await page.evaluate(async(p)=>{
    const r=await fetch(`/api/v1/messaging/messages/${p}/thread?limit=10`,{credentials:'include'});
    const t=await r.text();
    return {status:r.status, body:t.slice(0,170)};}, setup.parent);
  out.channelRow=await page.evaluate(async({ch,p})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=30`,{credentials:'include'});
    const j=await r.json(); const m=(j.messages||[]).find(x=>x.id===p);
    return m? {body:(m.body||'')||'(empty)', reply_count:m.reply_count}:'absent';},{ch,p:setup.parent});
  // open the thread from a clean load and read the screen
  await page.goto('about:blank'); await page.waitForTimeout(700);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}?thread=${setup.parent}`);
  await page.waitForTimeout(11000);
  out.screen=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const texts=[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&v(e))
      .map(e=>(e.textContent||'').trim())
      .filter(t=>/Replies|Could not load|Retry|QA-V2-DT reply/.test(t));
    return {lines:[...new Set(texts)].slice(0,6),
      retryButtons:[...document.querySelectorAll('button')].filter(v)
        .filter(b=>/retry/i.test(b.innerText||'')).length};});
  out.PASS = out.threadAfter.status===404 && out.channelRow.reply_count===3
             && out.screen.lines.some(t=>/Could not load/.test(t))
             && !out.screen.lines.some(t=>/QA-V2-DT reply/.test(t));
  return out;
};
