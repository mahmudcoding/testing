export default async ({page}) => page.evaluate((id)=>{
  const e=document.querySelector(`[data-message-id="${id}"]`);
  if(!e) return {msg:'gone'};
  const v=(x)=>{const r=x.getBoundingClientRect();return r.width>2&&r.height>2;};
  const node=[...e.querySelectorAll('*')].filter(v)
    .find(x=>/^Seen by/i.test(x.getAttribute('aria-label')||''));
  if(!node) return {found:false};
  const attrs={}; for(const a of node.attributes) attrs[a.name]=a.value.slice(0,40);
  const parent=node.parentElement;
  const pattrs={}; if(parent) for(const a of parent.attributes) pattrs[a.name]=a.value.slice(0,40);
  const r=node.getBoundingClientRect();
  return {found:true, tag:node.tagName, attrs,
    rect:{x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height)},
    parentTag:parent?parent.tagName:null, parentAttrs:pattrs,
    childTags:[...node.children].map(c=>c.tagName+(c.getAttribute('aria-label')?':'+c.getAttribute('aria-label').slice(0,20):'')),
    nearbyButtons:[...e.querySelectorAll('button')].filter(v)
      .map(b=>(b.getAttribute('aria-label')||b.innerText||'(unnamed)').slice(0,26)).slice(0,8)};
}, 'M4OXEWL01S5558H');
