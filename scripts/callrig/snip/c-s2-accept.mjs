export default async ({page}) => page.evaluate(()=>{
  const ins=[...document.querySelectorAll('input[type=file]')];
  return {n:ins.length, inputs:ins.map(i=>({accept:i.getAttribute('accept'), multiple:i.multiple,
    hidden:i.getBoundingClientRect().height===0}))};
});
