const KEY='teacherToolkitEPAL.storage.v2';
export const blankState={storageVersion:2,settings:{theme:'light',subject:'Υγιεινή',presentation:false},stats:{rounds:0,quizCorrect:0,quizTotal:0,wheelSpins:0},favorites:[],notes:{},databases:[]};
export function loadState(){try{const raw=localStorage.getItem(KEY);if(!raw)return structuredClone(blankState);const s=JSON.parse(raw);return migrate(s)}catch(e){return structuredClone(blankState)}}
function migrate(s){const base=structuredClone(blankState);return {...base,...s,settings:{...base.settings,...(s.settings||{})},stats:{...base.stats,...(s.stats||{})},favorites:s.favorites||[],notes:s.notes||{},databases:s.databases||[]}}
export function saveState(state){localStorage.setItem(KEY,JSON.stringify(state));const el=document.getElementById('saveStatus');if(el){el.textContent='Αποθηκεύτηκε';clearTimeout(window.__saveStatus);window.__saveStatus=setTimeout(()=>el.textContent='Ενεργό',900)}}
export function resetState(){localStorage.removeItem(KEY)}
