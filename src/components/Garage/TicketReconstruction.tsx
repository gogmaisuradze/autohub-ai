import React from 'react';
export const RECONSTRUCTION_IDS = new Set([297,616,617,618,619,299,1911,929,2183]);
export function ReconstructionSwitch({enabled,onChange}:{enabled:boolean;onChange:(value:boolean)=>void}) {
 return <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
   <div><p className="text-xs font-bold text-navy">AutoHub-ის სასწავლო რეკონსტრუქციები</p><p className="text-[11px] text-slate-500 mt-1">არჩევითი დამატებითი სქემები უსურათო ბილეთებისთვის · პასუხის შემდეგ იხსნება მხოლოდ ღილაკით.</p></div>
   <button type="button" role="switch" aria-checked={enabled} onClick={()=>onChange(!enabled)} className={`rounded-xl px-4 py-2 text-xs font-bold ${enabled?'bg-navy text-white':'bg-slate-100 text-slate-600'}`}>{enabled?'ჩართულია · გამორთვა':'სასწავლო ვიზუალების ჩართვა'}</button>
 </div>;
}
function Car({x,y,rotate=0,color='#bd1d24'}:{x:number;y:number;rotate?:number;color?:string}) {
 return <g transform={`translate(${x} ${y}) rotate(${rotate})`}><rect x="-16" y="-30" width="32" height="60" rx="7" fill={color} stroke="#292929" strokeWidth="1.5"/><path d="M-12-16h24l-2 12h-20zM-10 12h20l2 10h-24z" fill="#b9d6e5" stroke="#555"/><path d="M-19-19v10M19-19v10M-19 12v10M19 12v10" stroke="#242424" strokeWidth="5"/><path d="M-11-29h7M4-29h7" stroke="#fff4c1" strokeWidth="3"/></g>;
}
export function TicketReconstruction({id}:{id:number}) {
 if(!RECONSTRUCTION_IDS.has(id))return null;
 const priority=id===297,distance=[616,617,618,619].includes(id),reverse=id===299||id===1911;
 const seconds:Record<number,number>={616:2,617:3,618:6,619:9};
 const title=priority?'მარჯვნიდან მოახლოებულისთვის გზის დათმობა':distance?'ავტომობილებს შორის დროითი დისტანცია':reverse?'უკუსვლა — გარემოს შემოწმება':'მისაბმელი და გაზრდილი სამუხრუჭე მანძილი';
 return <figure className="mt-4 rounded-2xl border border-slate-200 bg-white overflow-hidden">
   <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 text-[11px] text-slate-600"><strong>AutoHub-ის სასწავლო რეკონსტრუქცია</strong> · დამატებითი განმარტება</div>
   <svg viewBox="0 0 560 300" role="img" aria-label={title} className="w-full max-h-72">
    <rect width="560" height="300" fill="#d6e7bf"/>
    {priority?<><path d="M220 0h120v300H220zM0 90h560v120H0z" fill="#858585"/><path d="M280 0v80M280 220v80M0 150h210M350 150h210" stroke="white" strokeWidth="3" strokeDasharray="16 12"/><Car x={250} y={252}/><Car x={445} y={179} rotate={-90} color="#234db5"/><path d="M250 210v-56" stroke="#d21f26" strokeWidth="5"/><path d="M242 170l8-16 8 16" fill="none" stroke="#d21f26" strokeWidth="5"/><path d="M400 179h-65" stroke="#173e9c" strokeWidth="5"/><path d="M350 171l-15 8 15 8" fill="none" stroke="#173e9c" strokeWidth="5"/><rect x="15" y="15" width="194" height="38" rx="4" fill="white"/><text x="112" y="39" textAnchor="middle" fontSize="13" fill="#222">ლურჯი მოდის მარჯვნიდან</text></>:<><path d="M0 65h560v170H0z" fill="#858585"/><path d="M0 150h560" stroke="white" strokeWidth="3" strokeDasharray="18 12"/>
    {distance?<><Car x={130} y={108} rotate={90}/><Car x={420} y={108} rotate={90} color="#234db5"/><path d="M180 198h190m-190-8v16m190-16v16" stroke="#222" strokeWidth="2"/><rect x="221" y="177" width="110" height="42" rx="4" fill="white"/><text x="276" y="204" textAnchor="middle" fontSize="18">≥ {seconds[id]} წამი</text><text x="280" y="274" textAnchor="middle" fontSize="13">{id===618||id===619?'მოყინული გზა':'ნორმალური მოძრაობის პირობები'} · {id===616||id===618?'დასახლებული პუნქტი':'დაუსახლებელი პუნქტი'}</text></>:reverse?<><Car x={280} y={109} rotate={90}/><path d="M220 110h-85m18-9-18 9 18 9" stroke="#c82127" strokeWidth="5" fill="none"/><path d="M175 85a110 110 0 0 0 0 150" stroke="#e3b335" strokeDasharray="6 5" strokeWidth="3" fill="none"/><text x="280" y="274" textAnchor="middle" fontSize="13">{id===1911?'სხვა პირის დახმარება დასაშვებია':'მანევრამდე შეამოწმე გარემო და სხვა მონაწილეები'}</text></>:<><Car x={160} y={110} rotate={90}/><rect x="61" y="96" width="48" height="28" rx="4" fill="#d1d1d1" stroke="#333"/><path d="M109 110h20M210 110h240" stroke="#c82127" strokeWidth="4" strokeDasharray="9 5"/><path d="M435 102l15 8-15 8" fill="none" stroke="#c82127" strokeWidth="4"/><text x="280" y="274" textAnchor="middle" fontSize="13">{id===929?'მისაბმელი საკუთარი სამუხრუჭე სისტემის გარეშე':'ავტომატარებელი — საჭიროა მეტი დისტანცია'}</text></>}
    </>}
   </svg>
   <figcaption className="p-3 text-[11px] leading-relaxed text-slate-500">{title}. სქემა პირობითია და მასშტაბს არ ასახავს. ბილეთის საწყის წყაროს სურათი არ ახლავს; ეს AutoHub-ის დამატებითი სასწავლო მასალაა.</figcaption>
 </figure>;
}
