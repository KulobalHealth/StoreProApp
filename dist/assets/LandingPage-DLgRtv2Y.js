import{j as e,l as R}from"./index-BCQwJBZs.js";import{r as o,L as N}from"./vendor-react-0YXfxJj6.js";import{M as H,u as O,P as G,a as K,b as $,L as U,m as i}from"./proxy-DoYXxFTI.js";import{i as A}from"./vendor-motion-DYGZ27pD.js";import"./vendor-icons-B58hqKNt.js";function T(t,d){if(typeof t=="function")return t(d);t!=null&&(t.current=d)}function Y(...t){return d=>{let a=!1;const c=t.map(h=>{const p=T(h,d);return!a&&typeof p=="function"&&(a=!0),p});if(a)return()=>{for(let h=0;h<c.length;h++){const p=c[h];typeof p=="function"?p():T(t[h],null)}}}}function q(...t){return o.useCallback(Y(...t),t)}class J extends o.Component{getSnapshotBeforeUpdate(d){const a=this.props.childRef.current;if(A(a)&&d.isPresent&&!this.props.isPresent&&this.props.pop!==!1){const c=a.offsetParent,h=A(c)&&c.offsetWidth||0,p=A(c)&&c.offsetHeight||0,f=getComputedStyle(a),s=this.props.sizeRef.current;s.height=parseFloat(f.height),s.width=parseFloat(f.width),s.top=a.offsetTop,s.left=a.offsetLeft,s.right=h-s.width-s.left,s.bottom=p-s.height-s.top}return null}componentDidUpdate(){}render(){return this.props.children}}function X({children:t,isPresent:d,anchorX:a,anchorY:c,root:h,pop:p}){const f=o.useId(),s=o.useRef(null),r=o.useRef({width:0,height:0,top:0,left:0,right:0,bottom:0}),{nonce:n}=o.useContext(H),x=t.props?.ref??t?.ref,C=q(s,x);return o.useInsertionEffect(()=>{const{width:g,height:b,top:v,left:w,right:j,bottom:F}=r.current;if(d||p===!1||!s.current||!g||!b)return;const L=a==="left"?`left: ${w}`:`right: ${j}`,I=c==="bottom"?`bottom: ${F}`:`top: ${v}`;s.current.dataset.motionPopId=f;const u=document.createElement("style");n&&(u.nonce=n);const z=h??document.head;return z.appendChild(u),u.sheet&&u.sheet.insertRule(`
          [data-motion-pop-id="${f}"] {
            position: absolute !important;
            width: ${g}px !important;
            height: ${b}px !important;
            ${L}px !important;
            ${I}px !important;
          }
        `),()=>{s.current?.removeAttribute("data-motion-pop-id"),z.contains(u)&&z.removeChild(u)}},[d]),e.jsx(J,{isPresent:d,childRef:s,sizeRef:r,pop:p,children:p===!1?t:o.cloneElement(t,{ref:C})})}const Q=({children:t,initial:d,isPresent:a,onExitComplete:c,custom:h,presenceAffectsLayout:p,mode:f,anchorX:s,anchorY:r,root:n})=>{const x=O(Z),C=o.useId();let g=!0,b=o.useMemo(()=>(g=!1,{id:C,initial:d,isPresent:a,custom:h,onExitComplete:v=>{x.set(v,!0);for(const w of x.values())if(!w)return;c&&c()},register:v=>(x.set(v,!1),()=>x.delete(v))}),[a,x,c]);return p&&g&&(b={...b}),o.useMemo(()=>{x.forEach((v,w)=>x.set(w,!1))},[a]),o.useEffect(()=>{!a&&!x.size&&c&&c()},[a]),t=e.jsx(X,{pop:f==="popLayout",isPresent:a,anchorX:s,anchorY:r,root:n,children:t}),e.jsx(G.Provider,{value:b,children:t})};function Z(){return new Map}const M=t=>t.key||"";function V(t){const d=[];return o.Children.forEach(t,a=>{o.isValidElement(a)&&d.push(a)}),d}const _=({children:t,custom:d,initial:a=!0,onExitComplete:c,presenceAffectsLayout:h=!0,mode:p="sync",propagate:f=!1,anchorX:s="left",anchorY:r="top",root:n})=>{const[x,C]=K(f),g=o.useMemo(()=>V(t),[t]),b=f&&!x?[]:g.map(M),v=o.useRef(!0),w=o.useRef(g),j=O(()=>new Map),F=o.useRef(new Set),[L,I]=o.useState(g),[u,z]=o.useState(g);$(()=>{v.current=!1,w.current=g;for(let y=0;y<u.length;y++){const m=M(u[y]);b.includes(m)?(j.delete(m),F.current.delete(m)):j.get(m)!==!0&&j.set(m,!1)}},[u,b.length,b.join("-")]);const P=[];if(g!==L){let y=[...g];for(let m=0;m<u.length;m++){const S=u[m],B=M(S);b.includes(B)||(y.splice(m,0,S),P.push(S))}return p==="wait"&&P.length&&(y=P),z(V(y)),I(g),null}const{forceRender:W}=o.useContext(U);return e.jsx(e.Fragment,{children:u.map(y=>{const m=M(y),S=f&&!x?!1:g===u||b.includes(m),B=()=>{if(F.current.has(m))return;if(j.has(m))F.current.add(m),j.set(m,!0);else return;let E=!0;j.forEach(D=>{D||(E=!1)}),E&&(W?.(),z(w.current),f&&C?.(),c&&c())};return e.jsx(Q,{isPresent:S,initial:!v.current||a?void 0:!1,custom:d,presenceAffectsLayout:h,mode:p,root:n,onExitComplete:S?void 0:B,anchorX:s,anchorY:r,children:y},m)})})},ee="/assets/Professional%20bold%20we%20are%20hiring%20promo%20linkedin%20post%20%20(Presentation)-CHTzi-8O.mp4",re="/assets/1662123687706-CyMeOr4q.jpeg",ie="/assets/client2-Q5cqIqwa.png",te="/assets/download-Dp9o4XVD.jpeg",ne="/assets/01-J2VhJgCa.jpg",ae="/assets/02-CxK2gsW2.jpg",oe="/assets/03-BKYL1OPJ.jpg",se="/assets/mockup1-cFqSt68h.png",le="/assets/mockup2-DJNYWy5Z.png",l={hidden:{opacity:0,y:32},visible:{opacity:1,y:0}},k={hidden:{},visible:{transition:{staggerChildren:.1}}},ge=()=>{const t=[{icon:e.jsxs("svg",{width:"28",height:"28",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"}),e.jsx("polyline",{points:"3.27 6.96 12 12.01 20.73 6.96"}),e.jsx("line",{x1:"12",y1:"22.08",x2:"12",y2:"12"})]}),title:"Inventory",bg:"#0B2247"},{icon:e.jsxs("svg",{width:"28",height:"28",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("rect",{x:"2",y:"3",width:"20",height:"14",rx:"2"}),e.jsx("line",{x1:"8",y1:"21",x2:"16",y2:"21"}),e.jsx("line",{x1:"12",y1:"17",x2:"12",y2:"21"}),e.jsx("path",{d:"M6 8h.01M9 8h.01"}),e.jsx("path",{d:"M6 11h12"})]}),title:"Point of Sale",bg:"#FF751F"},{icon:e.jsx("svg",{width:"28",height:"28",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("path",{d:"M18 20V10M12 20V4M6 20v-6"})}),title:"Analytics",bg:"#0B2247"},{icon:e.jsxs("svg",{width:"28",height:"28",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"}),e.jsx("circle",{cx:"9",cy:"7",r:"4"}),e.jsx("path",{d:"M23 21v-2a4 4 0 00-3-3.87"}),e.jsx("path",{d:"M16 3.13a4 4 0 010 7.75"})]}),title:"Staff Management",bg:"#FF751F"},{icon:e.jsxs("svg",{width:"28",height:"28",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"9",cy:"21",r:"1"}),e.jsx("circle",{cx:"20",cy:"21",r:"1"}),e.jsx("path",{d:"M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"})]}),title:"Purchase Orders",bg:"#0B2247"},{icon:e.jsxs("svg",{width:"28",height:"28",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("rect",{x:"5",y:"2",width:"14",height:"20",rx:"2",ry:"2"}),e.jsx("line",{x1:"12",y1:"18",x2:"12.01",y2:"18"})]}),title:"Mobile-First",bg:"#FF751F"}],d=[{num:"01",icon:e.jsxs("svg",{width:"24",height:"24",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"}),e.jsx("circle",{cx:"8.5",cy:"7",r:"4"}),e.jsx("line",{x1:"20",y1:"8",x2:"20",y2:"14"}),e.jsx("line",{x1:"23",y1:"11",x2:"17",y2:"11"})]}),title:"Create account",desc:"Sign up with your phone or email in seconds.",bg:"#0B2247"},{num:"02",icon:e.jsxs("svg",{width:"24",height:"24",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"}),e.jsx("polyline",{points:"3.27 6.96 12 12.01 20.73 6.96"}),e.jsx("line",{x1:"12",y1:"22.08",x2:"12",y2:"12"})]}),title:"Add products",desc:"Import a spreadsheet or add items manually.",bg:"#FF751F"},{num:"03",icon:e.jsxs("svg",{width:"24",height:"24",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("rect",{x:"2",y:"3",width:"20",height:"14",rx:"2"}),e.jsx("line",{x1:"8",y1:"21",x2:"16",y2:"21"}),e.jsx("line",{x1:"12",y1:"17",x2:"12",y2:"21"}),e.jsx("path",{d:"M6 8h.01M9 8h.01"}),e.jsx("path",{d:"M6 11h12"})]}),title:"Start selling",desc:"Ring up sales, collect payments, print receipts.",bg:"#0B2247"},{num:"04",icon:e.jsx("svg",{width:"24",height:"24",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("path",{d:"M18 20V10M12 20V4M6 20v-6"})}),title:"Grow",desc:"Track trends and make smarter decisions.",bg:"#FF751F"}],a=[{text:"My losses from expired items dropped massively in the first month. I check my phone and know exactly what's running low.",name:"Abena Kyei",role:"Pharmacy Owner, Kumasi",photo:ne,metric:"40%",metricLabel:"less waste"},{text:"StorePro solved everything. Now we're faster, more accurate, and I can see every transaction from my phone.",name:"Kwame Owusu",role:"Supermarket Manager, Accra",photo:ae,metric:"2x",metricLabel:"faster checkout"},{text:"I run three boutiques and StorePro lets me see all of them in one dashboard. Setup took less than an hour.",name:"Suzzana Boateng",role:"Fashion Retailer, Dakar",photo:oe,metric:"3",metricLabel:"stores managed"}],c=[{name:"Starter",price:"GH₵ 300",period:"/ month",popular:!1,features:["Up to 100 products","Basic POS & sales tracking","1 staff user","Daily summary report","Mobile app access"],cta:"Get Started",bg:"#ffffff"},{name:"Professional",price:"GH₵ 1,200",period:"/ month",popular:!0,features:["Unlimited products","Full POS + Mobile Money","Up to 10 staff users","Advanced analytics","Low-stock alerts & reordering","Supplier management","SMS receipts"],cta:"Start Free Trial",bg:"#0B2247"},{name:"Enterprise",price:"Custom",period:"",popular:!1,features:["Multi-branch management","Unlimited staff users","Custom integrations & API","Dedicated account manager","Priority support (24/7)","Custom onboarding & training"],cta:"Contact Sales",bg:"#ffffff"}],[h,p]=o.useState(!1);o.useEffect(()=>{if(!localStorage.getItem("lp-cookie-consent")){const n=setTimeout(()=>p(!0),1500);return()=>clearTimeout(n)}},[]);const f=()=>{localStorage.setItem("lp-cookie-consent","accepted"),p(!1)},s=()=>{localStorage.setItem("lp-cookie-consent","declined"),p(!1)};return e.jsxs("div",{className:"lp-root",children:[e.jsx("style",{children:ce}),e.jsxs(i.nav,{className:"lp-nav",initial:{y:-60,opacity:0},animate:{y:0,opacity:1},transition:{duration:.5,ease:"easeOut"},children:[e.jsx(N,{to:"/",className:"lp-logo",children:e.jsx("img",{src:R,alt:"StorePro",className:"lp-logo-img"})}),e.jsxs("ul",{className:"lp-nav-links",children:[e.jsx("li",{children:e.jsx("a",{href:"#features",children:"Features"})}),e.jsx("li",{children:e.jsx("a",{href:"#how",children:"How It Works"})}),e.jsx("li",{children:e.jsx("a",{href:"#pricing",children:"Pricing"})}),e.jsx("li",{children:e.jsx("a",{href:"#testimonials",children:"Reviews"})}),e.jsx("li",{children:e.jsx(N,{to:"/login",className:"lp-nav-signin",children:"Sign In"})}),e.jsx("li",{children:e.jsx(N,{to:"/register",className:"lp-nav-cta",children:"Start Free →"})})]})]}),e.jsxs("section",{className:"lp-hero",id:"home",children:[e.jsx("div",{className:"lp-hero-glow lp-hero-glow-1"}),e.jsx("div",{className:"lp-hero-glow lp-hero-glow-2"}),e.jsx("div",{className:"lp-hero-noise"}),e.jsx("div",{className:"lp-hero-grid-bg"}),e.jsxs(i.div,{className:"lp-hero-center",initial:"hidden",animate:"visible",variants:k,children:[e.jsxs(i.div,{className:"lp-hero-badge",variants:l,transition:{duration:.5},children:[e.jsx("span",{className:"lp-badge-pulse"}),e.jsxs("span",{children:[e.jsx("span",{role:"img","aria-label":"Ghana flag",style:{fontSize:"1.2em",marginRight:"0.4em"},children:"🇬🇭"}),"Now available in Ghana"]})]}),e.jsxs(i.h1,{variants:l,transition:{duration:.6},children:[e.jsx("span",{className:"lp-hero-line",children:"The operating system"}),e.jsxs("span",{className:"lp-hero-line",children:["for ",e.jsx("em",{children:"modern retail."})]})]}),e.jsx(i.p,{className:"lp-hero-sub",variants:l,transition:{duration:.6},children:"Inventory, POS, staff management, and real-time analytics all unified in one beautiful platform. Built for African businesses that move fast."}),e.jsxs(i.div,{className:"lp-hero-actions",variants:l,transition:{duration:.5},children:[e.jsxs(N,{to:"/register",className:"lp-btn-primary",children:[e.jsx("span",{children:"Get Started Free"}),e.jsx("span",{className:"lp-btn-shine"})]}),e.jsxs(N,{to:"/download",className:"lp-btn-secondary",children:[e.jsx("span",{className:"lp-play-icon",children:"↓"}),"Download Desktop"]})]}),e.jsxs(i.div,{className:"lp-hero-social-proof",variants:l,transition:{duration:.5},children:[e.jsx("div",{className:"lp-avatar-stack",children:["AK","KO","FS","DA","NM"].map((r,n)=>e.jsx(i.div,{className:"lp-stack-avatar",style:{zIndex:5-n},initial:{opacity:0,scale:0},animate:{opacity:1,scale:1},transition:{delay:.6+n*.08,type:"spring",stiffness:260,damping:20},children:r},n))}),e.jsxs("div",{className:"lp-proof-text",children:[e.jsx("span",{className:"lp-proof-stars",children:"★★★★★"}),e.jsxs("span",{children:["Trusted by ",e.jsx("strong",{children:"2,400+"})," store owners"]})]})]})]}),e.jsx(i.div,{className:"lp-hero-video",initial:{opacity:0,y:60,scale:.95},animate:{opacity:1,y:0,scale:1},transition:{duration:.8,delay:.5,ease:"easeOut"},children:e.jsxs("div",{className:"lp-video-frame",children:[e.jsxs("div",{className:"lp-video-bar",children:[e.jsx("div",{className:"lp-vdot",style:{background:"#ff5f57"}}),e.jsx("div",{className:"lp-vdot",style:{background:"#ffbd2e"}}),e.jsx("div",{className:"lp-vdot",style:{background:"#28c840"}})]}),e.jsx("video",{src:ee,autoPlay:!0,muted:!0,loop:!0,playsInline:!0,preload:"metadata",className:"lp-video-el"})]})})]}),e.jsxs(i.div,{className:"lp-trusted",initial:"hidden",whileInView:"visible",viewport:{once:!0,amount:.3},variants:k,children:[e.jsx(i.p,{variants:l,transition:{duration:.5},children:"Trusted by stores across"}),e.jsx("div",{className:"lp-brand-row",children:[re,ie,te].map((r,n)=>e.jsx(i.img,{src:r,alt:`Client ${n+1}`,className:"lp-client-logo",loading:"lazy",initial:{opacity:0,y:12},whileInView:{opacity:1,y:0},viewport:{once:!0},transition:{duration:.4,delay:n*.1}},n))})]}),e.jsxs("section",{className:"lp-features",id:"features",children:[e.jsxs(i.div,{className:"lp-features-header",initial:"hidden",whileInView:"visible",viewport:{once:!0,amount:.3},variants:l,transition:{duration:.6},children:[e.jsx("div",{className:"lp-section-label",children:"Features"}),e.jsxs("h2",{className:"lp-section-title",style:{textAlign:"center"},children:["Everything you need,",e.jsx("br",{}),"nothing you don't"]}),e.jsx("p",{className:"lp-section-sub",style:{textAlign:"center",margin:"0.8rem auto 0"},children:"Simple, powerful tools for real business owners."})]}),e.jsx(i.div,{className:"lp-features-grid",initial:"hidden",whileInView:"visible",viewport:{once:!0,amount:.1},variants:k,children:t.map((r,n)=>e.jsxs(i.div,{className:"lp-fcard",style:{background:r.bg},variants:l,transition:{duration:.4},whileHover:{y:-4,scale:1.03},children:[e.jsx("div",{className:"lp-fcard-icon",children:r.icon}),e.jsx("span",{className:"lp-fcard-title",children:r.title})]},n))})]}),e.jsxs("section",{className:"lp-how",id:"how",children:[e.jsxs(i.div,{className:"lp-how-header",initial:"hidden",whileInView:"visible",viewport:{once:!0,amount:.3},variants:l,transition:{duration:.6},children:[e.jsx("div",{className:"lp-section-label",children:"How It Works"}),e.jsxs("h2",{className:"lp-section-title",style:{textAlign:"center"},children:["Up and running",e.jsx("br",{}),"in under 10 minutes"]})]}),e.jsx(i.div,{className:"lp-steps-grid",initial:"hidden",whileInView:"visible",viewport:{once:!0,amount:.1},variants:k,children:d.map((r,n)=>e.jsxs(i.div,{className:"lp-step-card",style:{background:r.bg},variants:l,transition:{duration:.4},whileHover:{y:-4,scale:1.03},children:[e.jsx("div",{className:"lp-step-num",children:r.num}),e.jsx("div",{className:"lp-step-icon",children:r.icon}),e.jsx("span",{className:"lp-step-title",children:r.title}),e.jsx("p",{className:"lp-step-desc",children:r.desc})]},n))})]}),e.jsx("section",{className:"lp-mobile",id:"mobile",children:e.jsxs("div",{className:"lp-mobile-inner",children:[e.jsxs(i.div,{className:"lp-mobile-content",initial:"hidden",whileInView:"visible",viewport:{once:!0,amount:.3},variants:k,children:[e.jsxs(i.h2,{className:"lp-section-title",variants:l,transition:{duration:.5},children:["Your store in",e.jsx("br",{}),"your pocket"]}),e.jsx(i.p,{className:"lp-mobile-desc",variants:l,transition:{duration:.5},children:"Track sales, manage inventory, and stay in control — wherever you are. No laptop required."}),e.jsx("div",{style:{height:"1.5rem"}})," ",e.jsx(i.div,{className:"lp-mobile-features",variants:k,children:[{icon:e.jsx("svg",{width:"20",height:"20",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("path",{d:"M18 20V10M12 20V4M6 20v-6"})}),title:"Track sales remotely",desc:"See real-time sales from any location."},{icon:e.jsxs("svg",{width:"20",height:"20",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"}),e.jsx("polyline",{points:"3.27 6.96 12 12.01 20.73 6.96"}),e.jsx("line",{x1:"12",y1:"22.08",x2:"12",y2:"12"})]}),title:"Inventory on the move",desc:"Check stock, update quantities, get alerts."},{icon:e.jsxs("svg",{width:"20",height:"20",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M22 11.08V12a10 10 0 11-5.93-9.14"}),e.jsx("polyline",{points:"22 4 12 14.01 9 11.01"})]}),title:"Instant notifications",desc:"Low-stock alerts and daily summaries."}].map((r,n)=>e.jsxs(i.div,{className:"lp-mobile-feat",variants:l,transition:{duration:.4},children:[e.jsx("div",{className:"lp-mobile-feat-icon",children:r.icon}),e.jsxs("div",{children:[e.jsx("div",{className:"lp-mobile-feat-title",children:r.title}),e.jsx("div",{className:"lp-mobile-feat-desc",children:r.desc})]})]},n))}),e.jsx(i.div,{variants:l,transition:{duration:.5},style:{marginTop:"2.5rem"},children:e.jsxs(N,{to:"/register",className:"lp-mobile-cta",children:["Get the App",e.jsxs("svg",{width:"16",height:"16",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("line",{x1:"5",y1:"12",x2:"19",y2:"12"}),e.jsx("polyline",{points:"12 5 19 12 12 19"})]})]})})]}),e.jsxs(i.div,{className:"lp-mobile-phones",initial:{opacity:0,y:40},whileInView:{opacity:1,y:0},viewport:{once:!0,amount:.2},transition:{duration:.7,delay:.2},children:[e.jsx("img",{src:se,alt:"StorePro mobile - sales view",className:"lp-phone lp-phone-1",loading:"lazy"}),e.jsx("img",{src:le,alt:"StorePro mobile - inventory view",className:"lp-phone lp-phone-2",loading:"lazy"})]})]})}),e.jsxs("section",{id:"pricing",className:"lp-pricing-section",children:[e.jsxs(i.div,{className:"lp-pricing-header",initial:"hidden",whileInView:"visible",viewport:{once:!0,amount:.3},variants:l,transition:{duration:.6},children:[e.jsx("div",{className:"lp-section-label",children:"Pricing"}),e.jsx("h2",{className:"lp-section-title",style:{textAlign:"center"},children:"Simple, transparent pricing"}),e.jsx("p",{className:"lp-section-sub",style:{textAlign:"center",margin:"0.8rem auto 0"},children:"No hidden fees. Cancel anytime."})]}),e.jsx(i.div,{className:"lp-pricing-grid",initial:"hidden",whileInView:"visible",viewport:{once:!0,amount:.1},variants:k,children:c.map((r,n)=>e.jsxs(i.div,{className:`lp-price-card${r.popular?" lp-price-popular":""}`,variants:l,transition:{duration:.4},whileHover:{y:-4},children:[r.popular&&e.jsx("div",{className:"lp-price-badge",children:"Most Popular"}),e.jsx("div",{className:"lp-price-plan-name",children:r.name}),e.jsxs("div",{className:"lp-price-amount",children:[r.price,r.period&&e.jsx("span",{className:"lp-price-period",children:r.period})]}),e.jsx("div",{className:"lp-price-divider"}),e.jsx("ul",{className:"lp-price-features",children:r.features.map((x,C)=>e.jsxs("li",{children:[e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("polyline",{points:"20 6 9 17 4 12"})}),x]},C))}),e.jsx(N,{to:"/register",className:`lp-price-cta${r.popular?" lp-price-cta-pop":""}`,children:r.cta})]},n))})]}),e.jsxs("section",{className:"lp-testimonials",id:"testimonials",children:[e.jsxs(i.div,{className:"lp-testimonials-header",initial:"hidden",whileInView:"visible",viewport:{once:!0,amount:.3},variants:l,transition:{duration:.6},children:[e.jsx("div",{className:"lp-section-label",children:"Reviews"}),e.jsxs("h2",{className:"lp-section-title",style:{textAlign:"center"},children:["Trusted by real",e.jsx("br",{}),"business owners"]})]}),e.jsx(i.div,{className:"lp-testimonials-grid",initial:"hidden",whileInView:"visible",viewport:{once:!0,amount:.1},variants:k,children:a.map((r,n)=>e.jsxs(i.div,{className:"lp-tcard",variants:l,transition:{duration:.4},whileHover:{y:-4},children:[e.jsxs("div",{className:"lp-tcard-metric",children:[e.jsx("span",{className:"lp-tcard-metric-value",children:r.metric}),e.jsx("span",{className:"lp-tcard-metric-label",children:r.metricLabel})]}),e.jsxs("p",{className:"lp-tcard-text",children:['"',r.text,'"']}),e.jsxs("div",{className:"lp-tcard-author",children:[e.jsx("img",{className:"lp-tcard-avatar",src:r.photo,alt:r.name,loading:"lazy"}),e.jsxs("div",{className:"lp-tcard-info",children:[e.jsx("span",{className:"lp-tcard-name",children:r.name}),e.jsx("span",{className:"lp-tcard-role",children:r.role})]})]})]},n))})]}),e.jsxs(i.section,{className:"lp-cta-banner",id:"cta",initial:"hidden",whileInView:"visible",viewport:{once:!0,amount:.3},variants:k,children:[e.jsxs(i.h2,{variants:l,transition:{duration:.6},children:["Your store deserves",e.jsx("br",{}),"better tools."]}),e.jsx(i.p,{variants:l,transition:{duration:.5},children:"Join 2,400+ small business owners who run leaner, smarter operations with StorePro. Start free — no credit card needed."}),e.jsx(i.div,{variants:l,transition:{duration:.5},children:e.jsx(N,{to:"/register",className:"lp-btn-primary lp-cta-btn",children:"Start Your Free Trial →"})}),e.jsx(i.p,{className:"lp-cta-note",variants:l,transition:{duration:.4},children:"14-day free trial · No credit card · Cancel anytime"})]}),e.jsxs(i.footer,{className:"lp-footer",initial:{opacity:0},whileInView:{opacity:1},viewport:{once:!0},transition:{duration:.6},children:[e.jsx("span",{className:"lp-footer-logo",children:e.jsx("img",{src:R,alt:"StorePro",style:{height:"28px",objectFit:"contain"}})}),e.jsxs("ul",{className:"lp-footer-links",children:[e.jsx("li",{children:e.jsx("a",{href:"#features",children:"Features"})}),e.jsx("li",{children:e.jsx("a",{href:"#pricing",children:"Pricing"})}),e.jsx("li",{children:e.jsx("a",{href:"#how",children:"How It Works"})}),e.jsx("li",{children:e.jsx("a",{href:"#testimonials",children:"Reviews"})})]}),e.jsx("span",{className:"lp-footer-copy",children:"© 2026 MicroBiz. All rights reserved."})]}),e.jsx(_,{children:h&&e.jsx(i.div,{className:"lp-cookie-banner",initial:{y:100,opacity:0},animate:{y:0,opacity:1},exit:{y:100,opacity:0},transition:{type:"spring",stiffness:260,damping:24},children:e.jsxs("div",{className:"lp-cookie-inner",children:[e.jsxs("div",{className:"lp-cookie-text",children:[e.jsxs("svg",{className:"lp-cookie-icon",width:"20",height:"20",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("circle",{cx:"8",cy:"9",r:"1",fill:"currentColor"}),e.jsx("circle",{cx:"15",cy:"11",r:"1",fill:"currentColor"}),e.jsx("circle",{cx:"10",cy:"15",r:"1",fill:"currentColor"})]}),e.jsxs("p",{children:["We use cookies to improve your experience. By continuing, you agree to our ",e.jsx("a",{href:"/terms",className:"lp-cookie-link",children:"Terms"})," and ",e.jsx("a",{href:"/privacy",className:"lp-cookie-link",children:"Privacy Policy"}),"."]})]}),e.jsxs("div",{className:"lp-cookie-actions",children:[e.jsx("button",{className:"lp-cookie-decline",onClick:s,children:"Decline"}),e.jsx("button",{className:"lp-cookie-accept",onClick:f,children:"Accept All"})]})]})})})]})},ce=`
.lp-root {
  --ink: #0B2247;
  --paper: #ffffff;
  --cream: #f4f6f9;
  --amber: #FF751F;
  --amber-light: #FF914D;
  --amber-dark: #E0600A;
  --sage: #0B2247;
  --rust: #d63031;
  --muted: #5a6a7e;
  --border: #e2e8f0;
  --card: #ffffff;

  font-family: 'Manrope', sans-serif;
  background: var(--paper);
  color: var(--ink);
  overflow-x: hidden;
  line-height: 1.5;
}

.lp-root *, .lp-root *::before, .lp-root *::after { box-sizing: border-box; }
.lp-root h1, .lp-root h2, .lp-root h3, .lp-root h4 { font-family: 'Manrope', sans-serif; margin: 0; }
.lp-root p { margin: 0; }
.lp-root ul { list-style: none; padding: 0; margin: 0; }

/* ─── NAV ─── */
.lp-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.1rem 5%;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
}

.lp-logo { display: flex; align-items: center; text-decoration: none; }
.lp-logo-img { height: 36px; object-fit: contain; }

.lp-nav-links {
  display: flex; gap: 2.2rem; align-items: center;
}

.lp-nav-links a {
  text-decoration: none; color: var(--muted);
  font-size: 0.92rem; font-weight: 500;
  transition: color 0.2s;
}
.lp-nav-links a:hover { color: var(--ink); }

.lp-nav-signin {
  color: var(--ink) !important; font-weight: 600 !important;
}

.lp-nav-cta {
  background: var(--ink); color: var(--paper) !important;
  padding: 0.55rem 1.3rem; border-radius: 4px;
  font-size: 0.88rem !important; font-weight: 600 !important;
  transition: background 0.2s, transform 0.15s !important;
}
.lp-nav-cta:hover { background: var(--amber-dark) !important; transform: translateY(-1px); }

/* ─── HERO ─── */
.lp-hero {
  min-height: 100vh;
  display: flex; flex-direction: column;
  align-items: center; justify-content: flex-start;
  padding: 10rem 5% 4rem;
  position: relative; overflow: hidden;
  background: var(--paper);
}

/* Ambient glow blobs */
.lp-hero-glow {
  position: absolute; border-radius: 50%;
  filter: blur(100px); z-index: 0; pointer-events: none;
}
.lp-hero-glow-1 {
  width: 600px; height: 600px;
  top: -120px; left: -100px;
  background: radial-gradient(circle, rgba(255,117,31,0.15) 0%, transparent 70%);
  animation: lpGlowFloat 8s ease-in-out infinite;
}
.lp-hero-glow-2 {
  width: 500px; height: 500px;
  bottom: -80px; right: -60px;
  background: radial-gradient(circle, rgba(11,34,71,0.1) 0%, transparent 70%);
  animation: lpGlowFloat 10s ease-in-out infinite reverse;
}

@keyframes lpGlowFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(30px, -20px) scale(1.08); }
}

.lp-hero-noise {
  position: absolute; inset: 0; z-index: 0;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  pointer-events: none;
}

.lp-hero-grid-bg {
  position: absolute; inset: 0; z-index: 0;
  background-image:
    linear-gradient(var(--border) 1px, transparent 1px),
    linear-gradient(90deg, var(--border) 1px, transparent 1px);
  background-size: 56px 56px;
  opacity: 0.35;
  mask-image: radial-gradient(ellipse at 50% 40%, black 30%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse at 50% 40%, black 30%, transparent 75%);
}

/* Centered hero content */
.lp-hero-center {
  position: relative; z-index: 1;
  text-align: center;
  max-width: 780px;
  display: flex; flex-direction: column; align-items: center;
}

.lp-hero-badge {
  display: inline-flex; align-items: center; gap: 0.6rem;
  background: rgba(255,117,31,0.08);
  border: 1px solid rgba(255,117,31,0.2);
  border-radius: 100px; padding: 0.4rem 1.1rem 0.4rem 0.7rem;
  font-size: 0.82rem; font-weight: 600;
  color: var(--amber-dark); margin-bottom: 2rem;
  backdrop-filter: blur(4px);
}

.lp-badge-pulse {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--amber-dark); position: relative;
}
.lp-badge-pulse::after {
  content: ''; position: absolute; inset: -3px;
  border-radius: 50%; background: rgba(255,117,31,0.3);
  animation: lpPulse 2s ease-in-out infinite;
}
@keyframes lpPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.8); opacity: 0; }
}

.lp-hero h1 {
  font-size: clamp(3.2rem, 6.5vw, 5.5rem);
  font-weight: 800; line-height: 1.06;
  letter-spacing: -0.045em;
}

.lp-hero-line { display: block; }

.lp-hero h1 em {
  font-style: normal;
  background: linear-gradient(135deg, var(--amber-dark) 0%, var(--amber) 50%, var(--amber-dark) 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: lpShimmer 4s ease-in-out infinite;
}

@keyframes lpShimmer {
  0%, 100% { background-position: 0% center; }
  50% { background-position: 200% center; }
}

.lp-hero-sub {
  margin-top: 1.5rem; font-size: 1.18rem;
  color: var(--muted); max-width: 540px;
  line-height: 1.7; font-weight: 400;
}

.lp-hero-actions {
  display: flex; gap: 1.2rem; align-items: center;
  margin-top: 2.8rem;
}

.lp-btn-primary {
  background: var(--ink); color: var(--paper);
  padding: 0.9rem 2.2rem; border-radius: 4px;
  font-family: 'Manrope', sans-serif;
  font-weight: 700; font-size: 0.95rem;
  text-decoration: none; border: none; cursor: pointer;
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  box-shadow: 0 4px 24px rgba(15,14,12,0.18);
  display: inline-flex; align-items: center; gap: 0.5rem;
  position: relative; overflow: hidden;
}
.lp-btn-primary:hover {
  background: var(--amber-dark); transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(255,117,31,0.35); color: var(--paper);
}

.lp-btn-shine {
  position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
  animation: lpShineSlide 3s ease-in-out infinite;
}
@keyframes lpShineSlide {
  0%, 100% { left: -100%; }
  50% { left: 100%; }
}

.lp-btn-secondary {
  color: var(--ink); font-size: 0.92rem; font-weight: 600;
  text-decoration: none; display: flex; align-items: center; gap: 0.6rem;
  transition: gap 0.2s, color 0.2s;
  padding: 0.9rem 1.4rem; border-radius: 4px;
  border: 1.5px solid var(--border);
  background: var(--card);
}
.lp-btn-secondary:hover { gap: 0.8rem; border-color: var(--muted); }
.lp-play-icon {
  width: 28px; height: 28px; border-radius: 50%;
  background: var(--amber); color: var(--ink);
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 0.6rem;
}

/* Social proof */
.lp-hero-social-proof {
  display: flex; align-items: center; gap: 1rem;
  margin-top: 3rem;
}
.lp-avatar-stack { display: flex; }
.lp-stack-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: var(--amber); color: var(--ink);
  font-family: 'Manrope', sans-serif; font-size: 0.65rem; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  border: 2.5px solid var(--paper);
  margin-left: -8px;
}
.lp-stack-avatar:first-child { margin-left: 0; }
.lp-stack-avatar:nth-child(2) { background: #e8f0fe; color: #0B2247; }
.lp-stack-avatar:nth-child(3) { background: #ffe8da; color: #E0600A; }
.lp-stack-avatar:nth-child(4) { background: #e0e7ff; color: #0B2247; }
.lp-stack-avatar:nth-child(5) { background: #fff0e6; color: #FF751F; }

.lp-proof-text { font-size: 0.85rem; color: var(--muted); display: flex; flex-direction: column; gap: 0.1rem; }
.lp-proof-text strong { color: var(--ink); }
.lp-proof-stars { color: var(--amber); font-size: 0.78rem; letter-spacing: 1px; }

/* ─── HERO VIDEO ─── */
.lp-hero-video {
  position: relative; z-index: 1;
  width: 100%; max-width: 960px;
  margin-top: 4rem;
}

.lp-video-frame {
  border-radius: 4px;
  overflow: hidden;
  background: var(--ink);
  box-shadow:
    0 0 0 1px rgba(0,0,0,0.06),
    0 4px 16px rgba(0,0,0,0.08),
    0 16px 48px rgba(0,0,0,0.12),
    0 32px 80px rgba(0,0,0,0.10);
}

.lp-video-bar {
  display: flex; align-items: center; gap: 6px;
  padding: 0.65rem 1rem;
  background: var(--ink);
}

.lp-vdot {
  width: 10px; height: 10px; border-radius: 50%;
  opacity: 0.85;
}

.lp-video-el {
  display: block;
  width: 100%; height: auto;
  border: none; outline: none;
}

/* ─── STAT ITEMS (legacy compat) ─── */
.lp-hero-stats {
  display: flex; gap: 3rem; margin-top: 4rem;
}
.lp-stat-item { display: flex; flex-direction: column; gap: 0.2rem; }
.lp-stat-num { font-family: 'Manrope', sans-serif; font-size: 1.8rem; font-weight: 800; color: var(--ink); }
.lp-stat-label { font-size: 0.8rem; color: var(--muted); font-weight: 500; }

/* ─── SECTIONS ─── */
.lp-features, .lp-how, .lp-pricing-section { padding: 6rem 5%; }
.lp-features { background: var(--cream); }
.lp-how { background: var(--cream); }
.lp-pricing-section { background: var(--paper); }

.lp-section-label {
  font-size: 0.78rem; font-weight: 700; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--amber-dark);
  margin-bottom: 0.8rem;
}

.lp-section-title {
  font-size: clamp(2rem, 3.5vw, 3rem);
  font-weight: 800; letter-spacing: -0.03em; line-height: 1.1;
}

.lp-section-sub {
  color: var(--muted); font-size: 1.05rem;
  line-height: 1.65; margin-top: 0.8rem; max-width: 520px;
}

/* ─── FEATURES GRID ─── */
.lp-features-header {
  margin-bottom: 3rem;
  display: flex; flex-direction: column; align-items: center;
  text-align: center;
}

.lp-features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  max-width: 680px;
  margin: 0 auto;
}

.lp-fcard {
  border-radius: 4px;
  padding: 2rem 1.5rem;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 1rem;
  text-align: center;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.lp-fcard:hover {
  box-shadow: 0 12px 32px rgba(0,0,0,0.15);
}

.lp-fcard-icon {
  width: 56px; height: 56px;
  border-radius: 4px;
  background: rgba(255,255,255,0.15);
  display: flex; align-items: center; justify-content: center;
  color: #fff;
}

.lp-fcard-title {
  font-size: 0.85rem; font-weight: 700;
  color: #fff; letter-spacing: -0.01em;
  line-height: 1.3;
}

@media (max-width: 640px) {
  .lp-features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* ─── HOW IT WORKS ─── */
.lp-how-header {
  display: flex; flex-direction: column; align-items: center;
  text-align: center; margin-bottom: 2.5rem;
}

.lp-steps-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  max-width: 820px;
  margin: 0 auto;
}

.lp-step-card {
  border-radius: 4px;
  padding: 1.75rem 1.25rem;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 0.6rem;
  text-align: center;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.lp-step-card:hover {
  box-shadow: 0 12px 32px rgba(0,0,0,0.15);
}

.lp-step-num {
  font-family: 'Manrope', sans-serif;
  font-size: 0.65rem; font-weight: 800;
  color: rgba(255,255,255,0.4);
  letter-spacing: 0.08em;
}

.lp-step-icon {
  width: 52px; height: 52px;
  border-radius: 4px;
  background: rgba(255,255,255,0.15);
  display: flex; align-items: center; justify-content: center;
  color: #fff;
}

.lp-step-title {
  font-size: 0.88rem; font-weight: 700;
  color: #fff; letter-spacing: -0.01em;
  line-height: 1.3;
}

.lp-step-desc {
  font-size: 0.75rem; color: rgba(255,255,255,0.55);
  line-height: 1.5; margin: 0;
}

@media (max-width: 640px) {
  .lp-steps-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* ─── MOBILE APP ─── */
.lp-mobile {
  padding: 6rem 5%;
  background: var(--paper);
}

.lp-mobile-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.lp-mobile-content {
  display: flex; flex-direction: column;
}

.lp-mobile-desc {
  font-size: 1rem; color: var(--muted);
  line-height: 1.65; margin-top: 0.8rem; margin-bottom: 5rem;
  max-width: 420px;
}

.lp-mobile-features {
  display: flex; flex-direction: column; gap: 1.25rem;
}

.lp-mobile-feat {
  display: flex; align-items: flex-start; gap: 0.85rem;
}

.lp-mobile-feat-icon {
  width: 40px; height: 40px; border-radius: 4px;
  background: #0B2247; color: #fff;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.lp-mobile-feat-title {
  font-size: 0.9rem; font-weight: 700; color: var(--ink);
  margin-bottom: 0.15rem;
}

.lp-mobile-feat-desc {
  font-size: 0.8rem; color: var(--muted); line-height: 1.5;
}

.lp-mobile-cta {
  display: inline-flex; align-items: center; gap: 0.5rem;
  padding: 0.75rem 1.75rem;
  background: var(--amber); color: #fff;
  font-size: 0.9rem; font-weight: 700;
  border-radius: 4px; text-decoration: none;
  transition: background 0.2s;
}

.lp-mobile-cta:hover {
  background: #e5680f;
}

.lp-mobile-phones {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  min-height: 420px;
}

.lp-phone {
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(11,34,71,0.15);
  object-fit: cover;
  width: 220px;
}

.lp-phone-1 {
  position: relative; z-index: 2;
  transform: rotate(-3deg);
}

.lp-phone-2 {
  position: absolute;
  right: 0; bottom: 0;
  z-index: 1;
  transform: rotate(3deg) translateX(20px);
  opacity: 0.92;
}

@media (max-width: 768px) {
  .lp-mobile-inner {
    grid-template-columns: 1fr;
    gap: 2.5rem;
    text-align: center;
  }
  .lp-mobile-content { align-items: center; }
  .lp-mobile-desc { margin-left: auto; margin-right: auto; }
  .lp-mobile-feat { text-align: left; }
  .lp-mobile-phones { min-height: 340px; }
  .lp-phone { width: 180px; }
}

/* ─── PRICING ─── */
.lp-pricing-header {
  display: flex; flex-direction: column; align-items: center;
  text-align: center; margin-bottom: 2.5rem;
}

.lp-pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  max-width: 900px;
  margin: 0 auto;
}

.lp-price-card {
  border: 1px solid var(--border); border-radius: 4px;
  padding: 2rem 1.75rem; background: #fff;
  position: relative; display: flex; flex-direction: column;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.lp-price-card:hover { box-shadow: 0 12px 32px rgba(0,0,0,0.08); }

.lp-price-card.lp-price-popular {
  background: #0B2247; border-color: #0B2247;
}

.lp-price-badge {
  position: absolute; top: 1rem; right: 1rem;
  background: #FF751F; color: #fff;
  font-size: 0.65rem; font-weight: 700; letter-spacing: 0.04em;
  padding: 3px 10px; border-radius: 100px;
  text-transform: uppercase;
}

.lp-price-plan-name {
  font-size: 0.8rem; font-weight: 700; letter-spacing: 0.06em;
  text-transform: uppercase; color: var(--muted); margin-bottom: 0.75rem;
}
.lp-price-popular .lp-price-plan-name { color: rgba(255,255,255,0.5); }

.lp-price-amount {
  font-size: 2.2rem; font-weight: 800; line-height: 1;
  letter-spacing: -0.03em; color: var(--ink);
}
.lp-price-popular .lp-price-amount { color: #fff; }

.lp-price-period {
  font-size: 0.85rem; font-weight: 500; color: var(--muted);
  margin-left: 2px;
}
.lp-price-popular .lp-price-period { color: rgba(255,255,255,0.45); }

.lp-price-divider {
  height: 1px; background: var(--border);
  margin: 1.25rem 0;
}
.lp-price-popular .lp-price-divider { background: rgba(255,255,255,0.1); }

.lp-price-features {
  display: flex; flex-direction: column; gap: 0.6rem;
  flex: 1;
}
.lp-price-features li {
  font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem;
  color: var(--muted);
}
.lp-price-features li svg {
  flex-shrink: 0; color: #10B981;
}
.lp-price-popular .lp-price-features li { color: rgba(255,255,255,0.7); }
.lp-price-popular .lp-price-features li svg { color: #FF751F; }

.lp-price-cta {
  display: block; text-align: center; margin-top: 1.5rem;
  padding: 0.7rem; border-radius: 4px;
  font-weight: 700; font-size: 0.85rem;
  text-decoration: none; transition: all 0.2s;
  border: 1.5px solid var(--border); color: var(--ink);
  background: transparent;
}
.lp-price-cta:hover {
  background: var(--ink); color: #fff; border-color: var(--ink);
}

.lp-price-cta.lp-price-cta-pop {
  background: #FF751F; color: #fff; border-color: #FF751F;
}
.lp-price-cta.lp-price-cta-pop:hover {
  background: #FF914D; border-color: #FF914D;
}

@media (max-width: 768px) {
  .lp-pricing-grid {
    grid-template-columns: 1fr;
    max-width: 400px;
  }
}

/* ─── TESTIMONIALS ─── */
.lp-testimonials {
  padding: 6rem 5%; background: var(--cream);
}

.lp-testimonials-header {
  display: flex; flex-direction: column; align-items: center;
  text-align: center; margin-bottom: 2.5rem;
}

.lp-testimonials-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  max-width: 900px;
  margin: 0 auto;
}

.lp-tcard {
  background: #fff; border: 1px solid var(--border);
  border-radius: 4px; padding: 1.75rem;
  display: flex; flex-direction: column; gap: 1rem;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.lp-tcard:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.07); }

.lp-tcard-metric {
  display: flex; align-items: baseline; gap: 0.4rem;
}

.lp-tcard-metric-value {
  font-size: 2rem; font-weight: 800;
  color: #FF751F; line-height: 1; letter-spacing: -0.03em;
}

.lp-tcard-metric-label {
  font-size: 0.78rem; font-weight: 600;
  color: var(--muted); text-transform: uppercase;
  letter-spacing: 0.04em;
}

.lp-tcard-text {
  font-size: 0.88rem; line-height: 1.6; color: var(--ink);
  flex: 1;
}

.lp-tcard-author {
  display: flex; align-items: center; gap: 0.65rem;
  padding-top: 0.75rem; border-top: 1px solid var(--border);
}

.lp-tcard-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  object-fit: cover; flex-shrink: 0;
}

.lp-tcard-info { display: flex; flex-direction: column; }
.lp-tcard-name { font-size: 0.8rem; font-weight: 700; color: var(--ink); }
.lp-tcard-role { font-size: 0.72rem; color: var(--muted); }

@media (max-width: 768px) {
  .lp-testimonials-grid {
    grid-template-columns: 1fr;
    max-width: 400px;
  }
}

/* ─── CTA BANNER ─── */
.lp-cta-banner {
  background: var(--ink); color: var(--paper);
  text-align: center; padding: 6rem 5%;
  position: relative; overflow: hidden;
}

.lp-cta-banner::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(ellipse at 50% 100%, rgba(255,117,31,0.15) 0%, transparent 60%);
}

.lp-cta-banner h2 {
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 800; letter-spacing: -0.04em;
  position: relative; margin-bottom: 1rem;
}

.lp-cta-banner > p {
  color: rgba(255,255,255,0.6); font-size: 1.05rem;
  max-width: 480px; margin: 0 auto 2.5rem; line-height: 1.6;
  position: relative;
}

.lp-cta-btn {
  background: var(--amber) !important; color: #ffffff !important;
  box-shadow: 0 8px 32px rgba(255,117,31,0.35);
  position: relative;
}
.lp-cta-btn:hover { background: var(--amber-light) !important; }

.lp-cta-note { font-size: 0.8rem; color: rgba(255,255,255,0.35); margin-top: 1rem; position: relative; }

/* ─── TRUSTED ─── */
.lp-trusted {
  text-align: center; padding: 3rem 5%;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.lp-trusted p {
  font-size: 0.78rem; font-weight: 600; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--muted); margin-bottom: 1.5rem;
}

.lp-brand-row { display: flex; justify-content: center; align-items: center; gap: 3rem; flex-wrap: wrap; }

.lp-client-logo {
  height: 72px; max-width: 200px;
  object-fit: contain;
  filter: grayscale(100%) opacity(0.45);
  transition: filter 0.3s ease;
}

.lp-client-logo:hover {
  filter: grayscale(0%) opacity(1);
}

/* ─── FOOTER ─── */
.lp-footer {
  background: var(--cream); border-top: 1px solid var(--border);
  padding: 3rem 5%; display: flex;
  justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: 1rem;
}

.lp-footer-logo { display: flex; align-items: center; }

.lp-footer-links { display: flex; gap: 2rem; }
.lp-footer-links a { text-decoration: none; color: var(--muted); font-size: 0.85rem; transition: color 0.2s; }
.lp-footer-links a:hover { color: var(--ink); }

.lp-footer-copy { font-size: 0.8rem; color: var(--muted); }

/* ─── DASHBOARD MOCKUP (legacy / reused pill styles) ─── */
.lp-pill { font-size: 0.58rem; font-weight: 700; padding: 0.15rem 0.4rem; border-radius: 100px; }
.lp-pill-in { background: rgba(11,34,71,0.1); color: var(--sage); }
.lp-pill-low { background: rgba(214,48,49,0.1); color: var(--rust); }

/* ─── RESPONSIVE ─── */
@media (max-width: 900px) {
  .lp-hero { padding: 8rem 5% 3rem; }
  .lp-hero h1 { font-size: clamp(2.5rem, 9vw, 4rem); }
  .lp-hero-video { margin-top: 2.5rem; max-width: 100%; }
  .lp-video-frame { border-radius: 4px; }
  .lp-hero-social-proof { flex-direction: column; gap: 0.6rem; }
  .lp-hero-actions { flex-direction: column; width: 100%; }
  .lp-btn-primary { width: 100%; text-align: center; justify-content: center; }
  .lp-btn-secondary { width: 100%; justify-content: center; }
  .lp-price-card.lp-popular { transform: none; }
  .lp-price-card.lp-popular:hover { transform: translateY(-4px); }
  .lp-footer { flex-direction: column; text-align: center; }
  .lp-nav-links { display: none; }
}

/* ─── COOKIE BANNER ─── */
.lp-cookie-banner {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
  width: 320px;
}

.lp-cookie-inner {
  background: var(--ink);
  color: var(--paper);
  border-radius: 4px;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  box-shadow: 0 12px 40px rgba(11,34,71,0.25);
}

.lp-cookie-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.75rem;
}

.lp-cookie-icon {
  flex-shrink: 0;
  color: var(--amber);
}

.lp-cookie-text p {
  font-size: 0.82rem;
  line-height: 1.55;
  color: rgba(255,255,255,0.85);
}

.lp-cookie-link {
  color: var(--amber);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.lp-cookie-link:hover {
  color: var(--amber-light);
}

.lp-cookie-actions {
  display: flex;
  gap: 0.6rem;
  width: 100%;
}

.lp-cookie-decline {
  flex: 1;
  padding: 0.55rem 0;
  border-radius: 4px;
  border: 1px solid rgba(255,255,255,0.25);
  background: transparent;
  color: rgba(255,255,255,0.8);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Manrope', sans-serif;
  transition: border-color 0.2s, color 0.2s;
  text-align: center;
}

.lp-cookie-decline:hover {
  border-color: rgba(255,255,255,0.5);
  color: #fff;
}

.lp-cookie-accept {
  flex: 1;
  padding: 0.55rem 0;
  border-radius: 4px;
  border: none;
  background: var(--amber);
  color: #fff;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Manrope', sans-serif;
  transition: background 0.2s;
  text-align: center;
}

.lp-cookie-accept:hover {
  background: #e5680f;
}

@media (max-width: 400px) {
  .lp-cookie-banner {
    width: calc(100% - 2rem);
    right: 1rem;
    bottom: 1rem;
  }
}
`;export{ge as default};
