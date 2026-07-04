export const $=(sel,root=document)=>root.querySelector(sel);export const $$=(sel,root=document)=>[...root.querySelectorAll(sel)];
export function esc(s=''){return String(s).replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));}
export function attr(s=''){return esc(s).replace(/'/g,'&#39;').replace(/"/g,'&quot;');}
export function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>el.classList.remove('show'),1800)}
export function download(text,name,type='application/json'){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1200)}
export function shuffle(arr){return [...arr].sort(()=>Math.random()-.5)}
export function modal(html){const back=document.createElement('div');back.className='modal-back';back.innerHTML=`<div class="modal">${html}</div>`;back.addEventListener('click',e=>{if(e.target===back)back.remove()});document.body.appendChild(back);return back}
export function closeModals(){document.querySelectorAll('.modal-back').forEach(x=>x.remove())}
