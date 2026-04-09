import{j as a,l as kt}from"./index-Be0046FS.js";import{r as c,L as T,u as Jt}from"./vendor-react-DjG28CMq.js";import{i as Y,g as Zt,s as Lt,a as et,b as Vt,c as lt,d as Qt,e as te,f as ee,h as ne,r as se,j as ie,k as At,l as oe,m as re,n as ae,o as le,S as ce,H as ue,F as j,p as he,q as de,t as Dt,u as H,v as fe,w as ct,x as E,y as Tt,z as me,A as ut,B as pe,C as W,D as Z,E as ht,G as ge,I as xe,J as S,K as ve,L as ye,M as we,N as dt,O as Pe,P as Ce,Q as be,R as ft,T as Ee,U as O,V as Me,W as Se,X as It,Y as je,Z as ke}from"./vendor-motion-DYGZ27pD.js";const nt=c.createContext({});function st(e){const t=c.useRef(null);return t.current===null&&(t.current=e()),t.current}const Le=typeof window<"u",Rt=Le?c.useLayoutEffect:c.useEffect,G=c.createContext(null),it=c.createContext({transformPagePoint:e=>e,isStatic:!1,reducedMotion:"never"});function mt(e,t){if(typeof e=="function")return e(t);e!=null&&(e.current=t)}function Ve(...e){return t=>{let n=!1;const s=e.map(i=>{const o=mt(i,t);return!n&&typeof o=="function"&&(n=!0),o});if(n)return()=>{for(let i=0;i<s.length;i++){const o=s[i];typeof o=="function"?o():mt(e[i],null)}}}}function Ae(...e){return c.useCallback(Ve(...e),e)}class De extends c.Component{getSnapshotBeforeUpdate(t){const n=this.props.childRef.current;if(Y(n)&&t.isPresent&&!this.props.isPresent&&this.props.pop!==!1){const s=n.offsetParent,i=Y(s)&&s.offsetWidth||0,o=Y(s)&&s.offsetHeight||0,r=getComputedStyle(n),l=this.props.sizeRef.current;l.height=parseFloat(r.height),l.width=parseFloat(r.width),l.top=n.offsetTop,l.left=n.offsetLeft,l.right=i-l.width-l.left,l.bottom=o-l.height-l.top}return null}componentDidUpdate(){}render(){return this.props.children}}function Te({children:e,isPresent:t,anchorX:n,anchorY:s,root:i,pop:o}){const r=c.useId(),l=c.useRef(null),g=c.useRef({width:0,height:0,top:0,left:0,right:0,bottom:0}),{nonce:f}=c.useContext(it),m=e.props?.ref??e?.ref,h=Ae(l,m);return c.useInsertionEffect(()=>{const{width:u,height:p,top:d,left:x,right:v,bottom:y}=g.current;if(t||o===!1||!l.current||!u||!p)return;const w=n==="left"?`left: ${x}`:`right: ${v}`,C=s==="bottom"?`bottom: ${y}`:`top: ${d}`;l.current.dataset.motionPopId=r;const P=document.createElement("style");f&&(P.nonce=f);const k=i??document.head;return k.appendChild(P),P.sheet&&P.sheet.insertRule(`
          [data-motion-pop-id="${r}"] {
            position: absolute !important;
            width: ${u}px !important;
            height: ${p}px !important;
            ${w}px !important;
            ${C}px !important;
          }
        `),()=>{l.current?.removeAttribute("data-motion-pop-id"),k.contains(P)&&k.removeChild(P)}},[t]),a.jsx(De,{isPresent:t,childRef:l,sizeRef:g,pop:o,children:o===!1?e:c.cloneElement(e,{ref:h})})}const Ie=({children:e,initial:t,isPresent:n,onExitComplete:s,custom:i,presenceAffectsLayout:o,mode:r,anchorX:l,anchorY:g,root:f})=>{const m=st(Re),h=c.useId();let u=!0,p=c.useMemo(()=>(u=!1,{id:h,initial:t,isPresent:n,custom:i,onExitComplete:d=>{m.set(d,!0);for(const x of m.values())if(!x)return;s&&s()},register:d=>(m.set(d,!1),()=>m.delete(d))}),[n,m,s]);return o&&u&&(p={...p}),c.useMemo(()=>{m.forEach((d,x)=>m.set(x,!1))},[n]),c.useEffect(()=>{!n&&!m.size&&s&&s()},[n]),e=a.jsx(Te,{pop:r==="popLayout",isPresent:n,anchorX:l,anchorY:g,root:f,children:e}),a.jsx(G.Provider,{value:p,children:e})};function Re(){return new Map}function Ft(e=!0){const t=c.useContext(G);if(t===null)return[!0,null];const{isPresent:n,onExitComplete:s,register:i}=t,o=c.useId();c.useEffect(()=>{if(e)return i(o)},[e]);const r=c.useCallback(()=>e&&s&&s(o),[o,s,e]);return!n&&s?[!1,r]:[!0]}const I=e=>e.key||"";function pt(e){const t=[];return c.Children.forEach(e,n=>{c.isValidElement(n)&&t.push(n)}),t}const Fe=({children:e,custom:t,initial:n=!0,onExitComplete:s,presenceAffectsLayout:i=!0,mode:o="sync",propagate:r=!1,anchorX:l="left",anchorY:g="top",root:f})=>{const[m,h]=Ft(r),u=c.useMemo(()=>pt(e),[e]),p=r&&!m?[]:u.map(I),d=c.useRef(!0),x=c.useRef(u),v=st(()=>new Map),y=c.useRef(new Set),[w,C]=c.useState(u),[P,k]=c.useState(u);Rt(()=>{d.current=!1,x.current=u;for(let M=0;M<P.length;M++){const b=I(P[M]);p.includes(b)?(v.delete(b),y.current.delete(b)):v.get(b)!==!0&&v.set(b,!1)}},[P,p.length,p.join("-")]);const U=[];if(u!==w){let M=[...u];for(let b=0;b<P.length;b++){const L=P[b],$=I(L);p.includes($)||(M.splice(b,0,L),U.push(L))}return o==="wait"&&U.length&&(M=U),k(pt(M)),C(u),null}const{forceRender:Kt}=c.useContext(nt);return a.jsx(a.Fragment,{children:P.map(M=>{const b=I(M),L=r&&!m?!1:u===P||p.includes(b),$=()=>{if(y.current.has(b))return;if(v.has(b))y.current.add(b),v.set(b,!0);else return;let at=!0;v.forEach(qt=>{qt||(at=!1)}),at&&(Kt?.(),k(x.current),r&&h?.(),s&&s())};return a.jsx(Ie,{isPresent:L,initial:!d.current||n?void 0:!1,custom:t,presenceAffectsLayout:i,mode:o,root:f,onExitComplete:L?void 0:$,anchorX:l,anchorY:g,children:M},b)})})},Ot=c.createContext({strict:!1}),gt={animation:["animate","variants","whileHover","whileTap","exit","whileInView","whileFocus","whileDrag"],exit:["exit"],drag:["drag","dragControls"],focus:["whileFocus"],hover:["whileHover","onHoverStart","onHoverEnd"],tap:["whileTap","onTap","onTapStart","onTapCancel"],pan:["onPan","onPanStart","onPanSessionStart","onPanEnd"],inView:["whileInView","onViewportEnter","onViewportLeave"],layout:["layout","layoutId"]};let xt=!1;function Oe(){if(xt)return;const e={};for(const t in gt)e[t]={isEnabled:n=>gt[t].some(s=>!!n[s])};Lt(e),xt=!0}function Bt(){return Oe(),Zt()}function Be(e){const t=Bt();for(const n in e)t[n]={...t[n],...e[n]};Lt(t)}const He=new Set(["animate","exit","variants","initial","style","values","variants","transition","transformTemplate","custom","inherit","onBeforeLayoutMeasure","onAnimationStart","onAnimationComplete","onUpdate","onDragStart","onDrag","onDragEnd","onMeasureDragConstraints","onDirectionLock","onDragTransitionEnd","_dragX","_dragY","onHoverStart","onHoverEnd","onViewportEnter","onViewportLeave","globalTapTarget","propagate","ignoreStrict","viewport"]);function N(e){return e.startsWith("while")||e.startsWith("drag")&&e!=="draggable"||e.startsWith("layout")||e.startsWith("onTap")||e.startsWith("onPan")||e.startsWith("onLayout")||He.has(e)}let Ht=e=>!N(e);function We(e){typeof e=="function"&&(Ht=t=>t.startsWith("on")?!N(t):e(t))}try{We(require("@emotion/is-prop-valid").default)}catch{}function Ne(e,t,n){const s={};for(const i in e)i==="values"&&typeof e.values=="object"||et(e[i])||(Ht(i)||n===!0&&N(i)||!t&&!N(i)||e.draggable&&i.startsWith("onDrag"))&&(s[i]=e[i]);return s}const z=c.createContext({});function Ge(e,t){if(Vt(e)){const{initial:n,animate:s}=e;return{initial:n===!1||lt(n)?n:void 0,animate:lt(s)?s:void 0}}return e.inherit!==!1?t:{}}function ze(e){const{initial:t,animate:n}=Ge(e,c.useContext(z));return c.useMemo(()=>({initial:t,animate:n}),[vt(t),vt(n)])}function vt(e){return Array.isArray(e)?e.join(" "):e}const ot=()=>({style:{},transform:{},transformOrigin:{},vars:{}});function Wt(e,t,n){for(const s in t)!et(t[s])&&!Qt(s,n)&&(e[s]=t[s])}function Ue({transformTemplate:e},t){return c.useMemo(()=>{const n=ot();return te(n,t,e),Object.assign({},n.vars,n.style)},[t])}function $e(e,t){const n=e.style||{},s={};return Wt(s,n,e),Object.assign(s,Ue(e,t)),s}function Ye(e,t){const n={},s=$e(e,t);return e.drag&&e.dragListener!==!1&&(n.draggable=!1,s.userSelect=s.WebkitUserSelect=s.WebkitTouchCallout="none",s.touchAction=e.drag===!0?"none":`pan-${e.drag==="x"?"y":"x"}`),e.tabIndex===void 0&&(e.onTap||e.onTapStart||e.whileTap)&&(n.tabIndex=0),n.style=s,n}const Nt=()=>({...ot(),attrs:{}});function _e(e,t,n,s){const i=c.useMemo(()=>{const o=Nt();return ee(o,t,ne(s),e.transformTemplate,e.style),{...o.attrs,style:{...o.style}}},[t]);if(e.style){const o={};Wt(o,e.style,e),i.style={...o,...i.style}}return i}const Xe=["animate","circle","defs","desc","ellipse","g","image","line","filter","marker","mask","metadata","path","pattern","polygon","polyline","rect","stop","switch","symbol","svg","text","tspan","use","view"];function rt(e){return typeof e!="string"||e.includes("-")?!1:!!(Xe.indexOf(e)>-1||/[A-Z]/u.test(e))}function Ke(e,t,n,{latestValues:s},i,o=!1,r){const g=(r??rt(e)?_e:Ye)(t,s,i,e),f=Ne(t,typeof e=="string",o),m=e!==c.Fragment?{...f,...g,ref:n}:{},{children:h}=t,u=c.useMemo(()=>et(h)?h.get():h,[h]);return c.createElement(e,{...m,children:u})}function qe({scrapeMotionValuesFromProps:e,createRenderState:t},n,s,i){return{latestValues:Je(n,s,i,e),renderState:t()}}function Je(e,t,n,s){const i={},o=s(e,{});for(const u in o)i[u]=se(o[u]);let{initial:r,animate:l}=e;const g=Vt(e),f=ie(e);t&&f&&!g&&e.inherit!==!1&&(r===void 0&&(r=t.initial),l===void 0&&(l=t.animate));let m=n?n.initial===!1:!1;m=m||r===!1;const h=m?l:r;if(h&&typeof h!="boolean"&&!At(h)){const u=Array.isArray(h)?h:[h];for(let p=0;p<u.length;p++){const d=oe(e,u[p]);if(d){const{transitionEnd:x,transition:v,...y}=d;for(const w in y){let C=y[w];if(Array.isArray(C)){const P=m?C.length-1:0;C=C[P]}C!==null&&(i[w]=C)}for(const w in x)i[w]=x[w]}}}return i}const Gt=e=>(t,n)=>{const s=c.useContext(z),i=c.useContext(G),o=()=>qe(e,t,s,i);return n?o():st(o)},Ze=Gt({scrapeMotionValuesFromProps:re,createRenderState:ot}),Qe=Gt({scrapeMotionValuesFromProps:ae,createRenderState:Nt}),tn=Symbol.for("motionComponentSymbol");function en(e,t,n){const s=c.useRef(n);c.useInsertionEffect(()=>{s.current=n});const i=c.useRef(null);return c.useCallback(o=>{o&&e.onMount?.(o);const r=s.current;if(typeof r=="function")if(o){const l=r(o);typeof l=="function"&&(i.current=l)}else i.current?(i.current(),i.current=null):r(o);else r&&(r.current=o);t&&(o?t.mount(o):t.unmount())},[t])}const zt=c.createContext({});function V(e){return e&&typeof e=="object"&&Object.prototype.hasOwnProperty.call(e,"current")}function nn(e,t,n,s,i,o){const{visualElement:r}=c.useContext(z),l=c.useContext(Ot),g=c.useContext(G),f=c.useContext(it),m=f.reducedMotion,h=f.skipAnimations,u=c.useRef(null),p=c.useRef(!1);s=s||l.renderer,!u.current&&s&&(u.current=s(e,{visualState:t,parent:r,props:n,presenceContext:g,blockInitialAnimation:g?g.initial===!1:!1,reducedMotionConfig:m,skipAnimations:h,isSVG:o}),p.current&&u.current&&(u.current.manuallyAnimateOnMount=!0));const d=u.current,x=c.useContext(zt);d&&!d.projection&&i&&(d.type==="html"||d.type==="svg")&&sn(u.current,n,i,x);const v=c.useRef(!1);c.useInsertionEffect(()=>{d&&v.current&&d.update(n,g)});const y=n[le],w=c.useRef(!!y&&typeof window<"u"&&!window.MotionHandoffIsComplete?.(y)&&window.MotionHasOptimisedAnimation?.(y));return Rt(()=>{p.current=!0,d&&(v.current=!0,window.MotionIsMounted=!0,d.updateFeatures(),d.scheduleRenderMicrotask(),w.current&&d.animationState&&d.animationState.animateChanges())}),c.useEffect(()=>{d&&(!w.current&&d.animationState&&d.animationState.animateChanges(),w.current&&(queueMicrotask(()=>{window.MotionHandoffMarkAsComplete?.(y)}),w.current=!1),d.enteringChildren=void 0)}),d}function sn(e,t,n,s){const{layoutId:i,layout:o,drag:r,dragConstraints:l,layoutScroll:g,layoutRoot:f,layoutAnchor:m,layoutCrossfade:h}=t;e.projection=new n(e.latestValues,t["data-framer-portal-id"]?void 0:Ut(e.parent)),e.projection.setOptions({layoutId:i,layout:o,alwaysMeasureLayout:!!r||l&&V(l),visualElement:e,animationType:typeof o=="string"?o:"both",initialPromotionConfig:s,crossfade:h,layoutScroll:g,layoutRoot:f,layoutAnchor:m})}function Ut(e){if(e)return e.options.allowProjection!==!1?e.projection:Ut(e.parent)}function _(e,{forwardMotionProps:t=!1,type:n}={},s,i){s&&Be(s);const o=n?n==="svg":rt(e),r=o?Qe:Ze;function l(f,m){let h;const u={...c.useContext(it),...f,layoutId:on(f)},{isStatic:p}=u,d=ze(f),x=r(f,p);if(!p&&typeof window<"u"){rn();const v=an(u);h=v.MeasureLayout,d.visualElement=nn(e,x,u,i,v.ProjectionNode,o)}return a.jsxs(z.Provider,{value:d,children:[h&&d.visualElement?a.jsx(h,{visualElement:d.visualElement,...u}):null,Ke(e,f,en(x,d.visualElement,m),x,p,t,o)]})}l.displayName=`motion.${typeof e=="string"?e:`create(${e.displayName??e.name??""})`}`;const g=c.forwardRef(l);return g[tn]=e,g}function on({layoutId:e}){const t=c.useContext(nt).id;return t&&e!==void 0?t+"-"+e:e}function rn(e,t){c.useContext(Ot).strict}function an(e){const t=Bt(),{drag:n,layout:s}=t;if(!n&&!s)return{};const i={...n,...s};return{MeasureLayout:n?.isEnabled(e)||s?.isEnabled(e)?i.MeasureLayout:void 0,ProjectionNode:i.ProjectionNode}}function ln(e,t){if(typeof Proxy>"u")return _;const n=new Map,s=(o,r)=>_(o,r,e,t),i=(o,r)=>s(o,r);return new Proxy(i,{get:(o,r)=>r==="create"?s:(n.has(r)||n.set(r,_(r,void 0,e,t)),n.get(r))})}const cn=(e,t)=>t.isSVG??rt(e)?new ce(t):new ue(t,{allowProjection:e!==c.Fragment});class un extends j{constructor(t){super(t),t.animationState||(t.animationState=he(t))}updateAnimationControlsSubscription(){const{animate:t}=this.node.getProps();At(t)&&(this.unmountControls=t.subscribe(this.node))}mount(){this.updateAnimationControlsSubscription()}update(){const{animate:t}=this.node.getProps(),{animate:n}=this.node.prevProps||{};t!==n&&this.updateAnimationControlsSubscription()}unmount(){this.node.animationState.reset(),this.unmountControls?.()}}let hn=0;class dn extends j{constructor(){super(...arguments),this.id=hn++,this.isExitComplete=!1}update(){if(!this.node.presenceContext)return;const{isPresent:t,onExitComplete:n}=this.node.presenceContext,{isPresent:s}=this.node.prevPresenceContext||{};if(!this.node.animationState||t===s)return;if(t&&s===!1){if(this.isExitComplete){const{initial:o,custom:r}=this.node.getProps();if(typeof o=="string"){const l=de(this.node,o,r);if(l){const{transition:g,transitionEnd:f,...m}=l;for(const h in m)this.node.getValue(h)?.jump(m[h])}}this.node.animationState.reset(),this.node.animationState.animateChanges()}else this.node.animationState.setActive("exit",!1);this.isExitComplete=!1;return}const i=this.node.animationState.setActive("exit",!t);n&&!t&&i.then(()=>{this.isExitComplete=!0,n(this.id)})}mount(){const{register:t,onExitComplete:n}=this.node.presenceContext||{};n&&n(this.id),t&&(this.unmount=t(this.id))}unmount(){}}const fn={animation:{Feature:un},exit:{Feature:dn}};function D(e){return{point:{x:e.pageX,y:e.pageY}}}const mn=e=>t=>Dt(t)&&e(t,D(t));function A(e,t,n,s){return H(e,t,mn(n),s)}const $t=({current:e})=>e?e.ownerDocument.defaultView:null,yt=new Set(["auto","scroll"]);class Yt{constructor(t,n,{transformPagePoint:s,contextWindow:i=window,dragSnapToOrigin:o=!1,distanceThreshold:r=3,element:l}={}){if(this.startEvent=null,this.lastMoveEvent=null,this.lastMoveEventInfo=null,this.lastRawMoveEventInfo=null,this.handlers={},this.contextWindow=window,this.scrollPositions=new Map,this.removeScrollListeners=null,this.onElementScroll=p=>{this.handleScroll(p.target)},this.onWindowScroll=()=>{this.handleScroll(window)},this.updatePoint=()=>{if(!(this.lastMoveEvent&&this.lastMoveEventInfo))return;this.lastRawMoveEventInfo&&(this.lastMoveEventInfo=R(this.lastRawMoveEventInfo,this.transformPagePoint));const p=X(this.lastMoveEventInfo,this.history),d=this.startEvent!==null,x=fe(p.offset,{x:0,y:0})>=this.distanceThreshold;if(!d&&!x)return;const{point:v}=p,{timestamp:y}=ct;this.history.push({...v,timestamp:y});const{onStart:w,onMove:C}=this.handlers;d||(w&&w(this.lastMoveEvent,p),this.startEvent=this.lastMoveEvent),C&&C(this.lastMoveEvent,p)},this.handlePointerMove=(p,d)=>{this.lastMoveEvent=p,this.lastRawMoveEventInfo=d,this.lastMoveEventInfo=R(d,this.transformPagePoint),E.update(this.updatePoint,!0)},this.handlePointerUp=(p,d)=>{this.end();const{onEnd:x,onSessionEnd:v,resumeAnimation:y}=this.handlers;if((this.dragSnapToOrigin||!this.startEvent)&&y&&y(),!(this.lastMoveEvent&&this.lastMoveEventInfo))return;const w=X(p.type==="pointercancel"?this.lastMoveEventInfo:R(d,this.transformPagePoint),this.history);this.startEvent&&x&&x(p,w),v&&v(p,w)},!Dt(t))return;this.dragSnapToOrigin=o,this.handlers=n,this.transformPagePoint=s,this.distanceThreshold=r,this.contextWindow=i||window;const g=D(t),f=R(g,this.transformPagePoint),{point:m}=f,{timestamp:h}=ct;this.history=[{...m,timestamp:h}];const{onSessionStart:u}=n;u&&u(t,X(f,this.history)),this.removeListeners=Tt(A(this.contextWindow,"pointermove",this.handlePointerMove),A(this.contextWindow,"pointerup",this.handlePointerUp),A(this.contextWindow,"pointercancel",this.handlePointerUp)),l&&this.startScrollTracking(l)}startScrollTracking(t){let n=t.parentElement;for(;n;){const s=getComputedStyle(n);(yt.has(s.overflowX)||yt.has(s.overflowY))&&this.scrollPositions.set(n,{x:n.scrollLeft,y:n.scrollTop}),n=n.parentElement}this.scrollPositions.set(window,{x:window.scrollX,y:window.scrollY}),window.addEventListener("scroll",this.onElementScroll,{capture:!0}),window.addEventListener("scroll",this.onWindowScroll),this.removeScrollListeners=()=>{window.removeEventListener("scroll",this.onElementScroll,{capture:!0}),window.removeEventListener("scroll",this.onWindowScroll)}}handleScroll(t){const n=this.scrollPositions.get(t);if(!n)return;const s=t===window,i=s?{x:window.scrollX,y:window.scrollY}:{x:t.scrollLeft,y:t.scrollTop},o={x:i.x-n.x,y:i.y-n.y};o.x===0&&o.y===0||(s?this.lastMoveEventInfo&&(this.lastMoveEventInfo.point.x+=o.x,this.lastMoveEventInfo.point.y+=o.y):this.history.length>0&&(this.history[0].x-=o.x,this.history[0].y-=o.y),this.scrollPositions.set(t,i),E.update(this.updatePoint,!0))}updateHandlers(t){this.handlers=t}end(){this.removeListeners&&this.removeListeners(),this.removeScrollListeners&&this.removeScrollListeners(),this.scrollPositions.clear(),me(this.updatePoint)}}function R(e,t){return t?{point:t(e.point)}:e}function wt(e,t){return{x:e.x-t.x,y:e.y-t.y}}function X({point:e},t){return{point:e,delta:wt(e,_t(t)),offset:wt(e,pn(t)),velocity:gn(t,.1)}}function pn(e){return e[0]}function _t(e){return e[e.length-1]}function gn(e,t){if(e.length<2)return{x:0,y:0};let n=e.length-1,s=null;const i=_t(e);for(;n>=0&&(s=e[n],!(i.timestamp-s.timestamp>ut(t)));)n--;if(!s)return{x:0,y:0};s===e[0]&&e.length>2&&i.timestamp-s.timestamp>ut(t)*2&&(s=e[1]);const o=pe(i.timestamp-s.timestamp);if(o===0)return{x:0,y:0};const r={x:(i.x-s.x)/o,y:(i.y-s.y)/o};return r.x===1/0&&(r.x=0),r.y===1/0&&(r.y=0),r}function xn(e,{min:t,max:n},s){return t!==void 0&&e<t?e=s?W(t,e,s.min):Math.max(e,t):n!==void 0&&e>n&&(e=s?W(n,e,s.max):Math.min(e,n)),e}function Pt(e,t,n){return{min:t!==void 0?e.min+t:void 0,max:n!==void 0?e.max+n-(e.max-e.min):void 0}}function vn(e,{top:t,left:n,bottom:s,right:i}){return{x:Pt(e.x,n,i),y:Pt(e.y,t,s)}}function Ct(e,t){let n=t.min-e.min,s=t.max-e.max;return t.max-t.min<e.max-e.min&&([n,s]=[s,n]),{min:n,max:s}}function yn(e,t){return{x:Ct(e.x,t.x),y:Ct(e.y,t.y)}}function wn(e,t){let n=.5;const s=Z(e),i=Z(t);return i>s?n=ht(t.min,t.max-s,e.min):s>i&&(n=ht(e.min,e.max-i,t.min)),ge(0,1,n)}function Pn(e,t){const n={};return t.min!==void 0&&(n.min=t.min-e.min),t.max!==void 0&&(n.max=t.max-e.min),n}const Q=.35;function Cn(e=Q){return e===!1?e=0:e===!0&&(e=Q),{x:bt(e,"left","right"),y:bt(e,"top","bottom")}}function bt(e,t,n){return{min:Et(e,t),max:Et(e,n)}}function Et(e,t){return typeof e=="number"?e:e[t]||0}const bn=new WeakMap;class En{constructor(t){this.openDragLock=null,this.isDragging=!1,this.currentDirection=null,this.originPoint={x:0,y:0},this.constraints=!1,this.hasMutatedConstraints=!1,this.elastic=xe(),this.latestPointerEvent=null,this.latestPanInfo=null,this.visualElement=t}start(t,{snapToCursor:n=!1,distanceThreshold:s}={}){const{presenceContext:i}=this.visualElement;if(i&&i.isPresent===!1)return;const o=h=>{n&&this.snapToCursor(D(h).point),this.stopAnimation()},r=(h,u)=>{const{drag:p,dragPropagation:d,onDragStart:x}=this.getProps();if(p&&!d&&(this.openDragLock&&this.openDragLock(),this.openDragLock=Ce(p),!this.openDragLock))return;this.latestPointerEvent=h,this.latestPanInfo=u,this.isDragging=!0,this.currentDirection=null,this.resolveConstraints(),this.visualElement.projection&&(this.visualElement.projection.isAnimationBlocked=!0,this.visualElement.projection.target=void 0),S(y=>{let w=this.getAxisMotionValue(y).get()||0;if(be.test(w)){const{projection:C}=this.visualElement;if(C&&C.layout){const P=C.layout.layoutBox[y];P&&(w=Z(P)*(parseFloat(w)/100))}}this.originPoint[y]=w}),x&&E.update(()=>x(h,u),!1,!0),dt(this.visualElement,"transform");const{animationState:v}=this.visualElement;v&&v.setActive("whileDrag",!0)},l=(h,u)=>{this.latestPointerEvent=h,this.latestPanInfo=u;const{dragPropagation:p,dragDirectionLock:d,onDirectionLock:x,onDrag:v}=this.getProps();if(!p&&!this.openDragLock)return;const{offset:y}=u;if(d&&this.currentDirection===null){this.currentDirection=Sn(y),this.currentDirection!==null&&x&&x(this.currentDirection);return}this.updateAxis("x",u.point,y),this.updateAxis("y",u.point,y),this.visualElement.render(),v&&E.update(()=>v(h,u),!1,!0)},g=(h,u)=>{this.latestPointerEvent=h,this.latestPanInfo=u,this.stop(h,u),this.latestPointerEvent=null,this.latestPanInfo=null},f=()=>{const{dragSnapToOrigin:h}=this.getProps();(h||this.constraints)&&this.startAnimation({x:0,y:0})},{dragSnapToOrigin:m}=this.getProps();this.panSession=new Yt(t,{onSessionStart:o,onStart:r,onMove:l,onSessionEnd:g,resumeAnimation:f},{transformPagePoint:this.visualElement.getTransformPagePoint(),dragSnapToOrigin:m,distanceThreshold:s,contextWindow:$t(this.visualElement),element:this.visualElement.current})}stop(t,n){const s=t||this.latestPointerEvent,i=n||this.latestPanInfo,o=this.isDragging;if(this.cancel(),!o||!i||!s)return;const{velocity:r}=i;this.startAnimation(r);const{onDragEnd:l}=this.getProps();l&&E.postRender(()=>l(s,i))}cancel(){this.isDragging=!1;const{projection:t,animationState:n}=this.visualElement;t&&(t.isAnimationBlocked=!1),this.endPanSession();const{dragPropagation:s}=this.getProps();!s&&this.openDragLock&&(this.openDragLock(),this.openDragLock=null),n&&n.setActive("whileDrag",!1)}endPanSession(){this.panSession&&this.panSession.end(),this.panSession=void 0}updateAxis(t,n,s){const{drag:i}=this.getProps();if(!s||!F(t,i,this.currentDirection))return;const o=this.getAxisMotionValue(t);let r=this.originPoint[t]+s[t];this.constraints&&this.constraints[t]&&(r=xn(r,this.constraints[t],this.elastic[t])),o.set(r)}resolveConstraints(){const{dragConstraints:t,dragElastic:n}=this.getProps(),s=this.visualElement.projection&&!this.visualElement.projection.layout?this.visualElement.projection.measure(!1):this.visualElement.projection?.layout,i=this.constraints;t&&V(t)?this.constraints||(this.constraints=this.resolveRefConstraints()):t&&s?this.constraints=vn(s.layoutBox,t):this.constraints=!1,this.elastic=Cn(n),i!==this.constraints&&!V(t)&&s&&this.constraints&&!this.hasMutatedConstraints&&S(o=>{this.constraints!==!1&&this.getAxisMotionValue(o)&&(this.constraints[o]=Pn(s.layoutBox[o],this.constraints[o]))})}resolveRefConstraints(){const{dragConstraints:t,onMeasureDragConstraints:n}=this.getProps();if(!t||!V(t))return!1;const s=t.current,{projection:i}=this.visualElement;if(!i||!i.layout)return!1;const o=ve(s,i.root,this.visualElement.getTransformPagePoint());let r=yn(i.layout.layoutBox,o);if(n){const l=n(ye(r));this.hasMutatedConstraints=!!l,l&&(r=we(l))}return r}startAnimation(t){const{drag:n,dragMomentum:s,dragElastic:i,dragTransition:o,dragSnapToOrigin:r,onDragTransitionEnd:l}=this.getProps(),g=this.constraints||{},f=S(m=>{if(!F(m,n,this.currentDirection))return;let h=g&&g[m]||{};(r===!0||r===m)&&(h={min:0,max:0});const u=i?200:1e6,p=i?40:1e7,d={type:"inertia",velocity:s?t[m]:0,bounceStiffness:u,bounceDamping:p,timeConstant:750,restDelta:1,restSpeed:10,...o,...h};return this.startAxisValueAnimation(m,d)});return Promise.all(f).then(l)}startAxisValueAnimation(t,n){const s=this.getAxisMotionValue(t);return dt(this.visualElement,t),s.start(Pe(t,s,0,n,this.visualElement,!1))}stopAnimation(){S(t=>this.getAxisMotionValue(t).stop())}getAxisMotionValue(t){const n=`_drag${t.toUpperCase()}`,s=this.visualElement.getProps(),i=s[n];return i||this.visualElement.getValue(t,(s.initial?s.initial[t]:void 0)||0)}snapToCursor(t){S(n=>{const{drag:s}=this.getProps();if(!F(n,s,this.currentDirection))return;const{projection:i}=this.visualElement,o=this.getAxisMotionValue(n);if(i&&i.layout){const{min:r,max:l}=i.layout.layoutBox[n],g=o.get()||0;o.set(t[n]-W(r,l,.5)+g)}})}scalePositionWithinConstraints(){if(!this.visualElement.current)return;const{drag:t,dragConstraints:n}=this.getProps(),{projection:s}=this.visualElement;if(!V(n)||!s||!this.constraints)return;this.stopAnimation();const i={x:0,y:0};S(r=>{const l=this.getAxisMotionValue(r);if(l&&this.constraints!==!1){const g=l.get();i[r]=wn({min:g,max:g},this.constraints[r])}});const{transformTemplate:o}=this.visualElement.getProps();this.visualElement.current.style.transform=o?o({},""):"none",s.root&&s.root.updateScroll(),s.updateLayout(),this.constraints=!1,this.resolveConstraints(),S(r=>{if(!F(r,t,null))return;const l=this.getAxisMotionValue(r),{min:g,max:f}=this.constraints[r];l.set(W(g,f,i[r]))}),this.visualElement.render()}addListeners(){if(!this.visualElement.current)return;bn.set(this.visualElement,this);const t=this.visualElement.current,n=A(t,"pointerdown",f=>{const{drag:m,dragListener:h=!0}=this.getProps(),u=f.target,p=u!==t&&Ee(u);m&&h&&!p&&this.start(f)});let s;const i=()=>{const{dragConstraints:f}=this.getProps();V(f)&&f.current&&(this.constraints=this.resolveRefConstraints(),s||(s=Mn(t,f.current,()=>this.scalePositionWithinConstraints())))},{projection:o}=this.visualElement,r=o.addEventListener("measure",i);o&&!o.layout&&(o.root&&o.root.updateScroll(),o.updateLayout()),E.read(i);const l=H(window,"resize",()=>this.scalePositionWithinConstraints()),g=o.addEventListener("didUpdate",(({delta:f,hasLayoutChanged:m})=>{this.isDragging&&m&&(S(h=>{const u=this.getAxisMotionValue(h);u&&(this.originPoint[h]+=f[h].translate,u.set(u.get()+f[h].translate))}),this.visualElement.render())}));return()=>{l(),n(),r(),g&&g(),s&&s()}}getProps(){const t=this.visualElement.getProps(),{drag:n=!1,dragDirectionLock:s=!1,dragPropagation:i=!1,dragConstraints:o=!1,dragElastic:r=Q,dragMomentum:l=!0}=t;return{...t,drag:n,dragDirectionLock:s,dragPropagation:i,dragConstraints:o,dragElastic:r,dragMomentum:l}}}function Mt(e){let t=!0;return()=>{if(t){t=!1;return}e()}}function Mn(e,t,n){const s=ft(e,Mt(n)),i=ft(t,Mt(n));return()=>{s(),i()}}function F(e,t,n){return(t===!0||t===e)&&(n===null||n===e)}function Sn(e,t=10){let n=null;return Math.abs(e.y)>t?n="y":Math.abs(e.x)>t&&(n="x"),n}class jn extends j{constructor(t){super(t),this.removeGroupControls=O,this.removeListeners=O,this.controls=new En(t)}mount(){const{dragControls:t}=this.node.getProps();t&&(this.removeGroupControls=t.subscribe(this.controls)),this.removeListeners=this.controls.addListeners()||O}update(){const{dragControls:t}=this.node.getProps(),{dragControls:n}=this.node.prevProps||{};t!==n&&(this.removeGroupControls(),t&&(this.removeGroupControls=t.subscribe(this.controls)))}unmount(){this.removeGroupControls(),this.removeListeners(),this.controls.isDragging||this.controls.endPanSession()}}const K=e=>(t,n)=>{e&&E.update(()=>e(t,n),!1,!0)};class kn extends j{constructor(){super(...arguments),this.removePointerDownListener=O}onPointerDown(t){this.session=new Yt(t,this.createPanHandlers(),{transformPagePoint:this.node.getTransformPagePoint(),contextWindow:$t(this.node)})}createPanHandlers(){const{onPanSessionStart:t,onPanStart:n,onPan:s,onPanEnd:i}=this.node.getProps();return{onSessionStart:K(t),onStart:K(n),onMove:K(s),onEnd:(o,r)=>{delete this.session,i&&E.postRender(()=>i(o,r))}}}mount(){this.removePointerDownListener=A(this.node.current,"pointerdown",t=>this.onPointerDown(t))}update(){this.session&&this.session.updateHandlers(this.createPanHandlers())}unmount(){this.removePointerDownListener(),this.session&&this.session.end()}}let q=!1;class Ln extends c.Component{componentDidMount(){const{visualElement:t,layoutGroup:n,switchLayoutGroup:s,layoutId:i}=this.props,{projection:o}=t;o&&(n.group&&n.group.add(o),s&&s.register&&i&&s.register(o),q&&o.root.didUpdate(),o.addEventListener("animationComplete",()=>{this.safeToRemove()}),o.setOptions({...o.options,layoutDependency:this.props.layoutDependency,onExitComplete:()=>this.safeToRemove()})),Me.hasEverUpdated=!0}getSnapshotBeforeUpdate(t){const{layoutDependency:n,visualElement:s,drag:i,isPresent:o}=this.props,{projection:r}=s;return r&&(r.isPresent=o,t.layoutDependency!==n&&r.setOptions({...r.options,layoutDependency:n}),q=!0,i||t.layoutDependency!==n||n===void 0||t.isPresent!==o?r.willUpdate():this.safeToRemove(),t.isPresent!==o&&(o?r.promote():r.relegate()||E.postRender(()=>{const l=r.getStack();(!l||!l.members.length)&&this.safeToRemove()}))),null}componentDidUpdate(){const{visualElement:t,layoutAnchor:n}=this.props,{projection:s}=t;s&&(s.options.layoutAnchor=n,s.root.didUpdate(),Se.postRender(()=>{!s.currentAnimation&&s.isLead()&&this.safeToRemove()}))}componentWillUnmount(){const{visualElement:t,layoutGroup:n,switchLayoutGroup:s}=this.props,{projection:i}=t;q=!0,i&&(i.scheduleCheckAfterUnmount(),n&&n.group&&n.group.remove(i),s&&s.deregister&&s.deregister(i))}safeToRemove(){const{safeToRemove:t}=this.props;t&&t()}render(){return null}}function Xt(e){const[t,n]=Ft(),s=c.useContext(nt);return a.jsx(Ln,{...e,layoutGroup:s,switchLayoutGroup:c.useContext(zt),isPresent:t,safeToRemove:n})}const Vn={pan:{Feature:kn},drag:{Feature:jn,ProjectionNode:It,MeasureLayout:Xt}};function St(e,t,n){const{props:s}=e;e.animationState&&s.whileHover&&e.animationState.setActive("whileHover",n==="Start");const i="onHover"+n,o=s[i];o&&E.postRender(()=>o(t,D(t)))}class An extends j{mount(){const{current:t}=this.node;t&&(this.unmount=je(t,(n,s)=>(St(this.node,s,"Start"),i=>St(this.node,i,"End"))))}unmount(){}}class Dn extends j{constructor(){super(...arguments),this.isActive=!1}onFocus(){let t=!1;try{t=this.node.current.matches(":focus-visible")}catch{t=!0}!t||!this.node.animationState||(this.node.animationState.setActive("whileFocus",!0),this.isActive=!0)}onBlur(){!this.isActive||!this.node.animationState||(this.node.animationState.setActive("whileFocus",!1),this.isActive=!1)}mount(){this.unmount=Tt(H(this.node.current,"focus",()=>this.onFocus()),H(this.node.current,"blur",()=>this.onBlur()))}unmount(){}}function jt(e,t,n){const{props:s}=e;if(e.current instanceof HTMLButtonElement&&e.current.disabled)return;e.animationState&&s.whileTap&&e.animationState.setActive("whileTap",n==="Start");const i="onTap"+(n==="End"?"":n),o=s[i];o&&E.postRender(()=>o(t,D(t)))}class Tn extends j{mount(){const{current:t}=this.node;if(!t)return;const{globalTapTarget:n,propagate:s}=this.node.props;this.unmount=ke(t,(i,o)=>(jt(this.node,o,"Start"),(r,{success:l})=>jt(this.node,r,l?"End":"Cancel")),{useGlobalTarget:n,stopPropagation:s?.tap===!1})}unmount(){}}const tt=new WeakMap,J=new WeakMap,In=e=>{const t=tt.get(e.target);t&&t(e)},Rn=e=>{e.forEach(In)};function Fn({root:e,...t}){const n=e||document;J.has(n)||J.set(n,{});const s=J.get(n),i=JSON.stringify(t);return s[i]||(s[i]=new IntersectionObserver(Rn,{root:e,...t})),s[i]}function On(e,t,n){const s=Fn(t);return tt.set(e,n),s.observe(e),()=>{tt.delete(e),s.unobserve(e)}}const Bn={some:0,all:1};class Hn extends j{constructor(){super(...arguments),this.hasEnteredView=!1,this.isInView=!1}startObserver(){this.stopObserver?.();const{viewport:t={}}=this.node.getProps(),{root:n,margin:s,amount:i="some",once:o}=t,r={root:n?n.current:void 0,rootMargin:s,threshold:typeof i=="number"?i:Bn[i]},l=g=>{const{isIntersecting:f}=g;if(this.isInView===f||(this.isInView=f,o&&!f&&this.hasEnteredView))return;f&&(this.hasEnteredView=!0),this.node.animationState&&this.node.animationState.setActive("whileInView",f);const{onViewportEnter:m,onViewportLeave:h}=this.node.getProps(),u=f?m:h;u&&u(g)};this.stopObserver=On(this.node.current,r,l)}mount(){this.startObserver()}update(){if(typeof IntersectionObserver>"u")return;const{props:t,prevProps:n}=this.node;["amount","margin","root"].some(Wn(t,n))&&this.startObserver()}unmount(){this.stopObserver?.(),this.hasEnteredView=!1,this.isInView=!1}}function Wn({viewport:e={}},{viewport:t={}}={}){return n=>e[n]!==t[n]}const Nn={inView:{Feature:Hn},tap:{Feature:Tn},focus:{Feature:Dn},hover:{Feature:An}},Gn={layout:{ProjectionNode:It,MeasureLayout:Xt}},zn={...fn,...Nn,...Vn,...Gn},B=ln(zn,cn),Un=`
.mh-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 1.1rem 5%;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.9);
}

.mh-logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  overflow: hidden;
}

.mh-logo-img {
  height: 36px;
  object-fit: contain;
  will-change: transform, opacity;
}

.mh-nav-links {
  display: flex;
  gap: 2.2rem;
  align-items: center;
  justify-self: center;
  list-style: none;
  padding: 0;
  margin: 0;
}

.mh-nav-item {
  position: relative;
}

.mh-nav-links a {
  text-decoration: none;
  color: #5a6a7e;
  font-size: 0.92rem;
  font-weight: 500;
  transition: color 0.2s;
}

.mh-nav-links a:hover {
  color: #0B2247;
}

.mh-nav-menu-trigger {
  appearance: none;
  border: 0;
  background: transparent;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0;
  cursor: pointer;
  color: #5a6a7e;
  font-size: 0.92rem;
  font-weight: 500;
  font-family: inherit;
  transition: color 0.2s ease;
}

.mh-nav-menu-trigger:hover,
.mh-nav-menu-trigger:focus-visible {
  color: #0B2247;
  outline: none;
}

.mh-nav-item--mega {
  padding: 1rem 0;
  margin: -1rem 0;
}

.mh-mega-menu {
  position: absolute;
  top: calc(100% + 18px);
  left: 0;
  width: min(760px, 78vw);
  padding: 1.25rem;
  border: 1px solid rgba(11, 34, 71, 0.08);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 28px 60px rgba(15, 23, 42, 0.14);
  backdrop-filter: blur(14px);
}

.mh-mega-menu::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 18px;
  width: 16px;
  height: 16px;
  transform: rotate(45deg);
  background: rgba(255, 255, 255, 0.98);
  border-left: 1px solid rgba(11, 34, 71, 0.08);
  border-top: 1px solid rgba(11, 34, 71, 0.08);
}

.mh-mega-menu-intro {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(11, 34, 71, 0.08);
}

.mh-mega-menu-label {
  display: inline-block;
  margin-bottom: 0.45rem;
  color: #FF751F;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.mh-mega-menu-intro h3 {
  margin: 0;
  font-size: 1.25rem;
  line-height: 1.2;
  letter-spacing: -0.03em;
  color: #0B2247;
}

.mh-mega-menu-intro p {
  margin: 0.45rem 0 0;
  color: #5a6a7e;
  font-size: 0.92rem;
}

.mh-mega-menu-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.mh-mega-menu-card {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 0.95rem;
  border-radius: 12px;
  border: 1px solid rgba(11, 34, 71, 0.06);
  background: #fff;
  text-decoration: none;
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.mh-mega-menu-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 117, 31, 0.22);
  box-shadow: 0 16px 28px rgba(15, 23, 42, 0.08);
}

.mh-mega-menu-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 117, 31, 0.08);
  color: #0B2247;
  flex: 0 0 auto;
}

.mh-mega-menu-copy {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.mh-mega-menu-copy strong {
  color: #0B2247;
  font-size: 0.95rem;
}

.mh-mega-menu-copy span {
  color: #5a6a7e;
  font-size: 0.82rem;
  line-height: 1.5;
}

.mh-nav-signin {
  color: #0B2247 !important;
  font-weight: 600 !important;
}

.mh-nav-cta {
  background: #0B2247;
  color: #ffffff !important;
  padding: 0.55rem 1.3rem;
  border-radius: 4px;
  font-size: 0.88rem !important;
  font-weight: 600 !important;
  transition: background 0.2s, transform 0.15s !important;
}

.mh-nav-cta:hover {
  background: #e16614 !important;
  transform: translateY(-1px);
}

@media (max-width: 900px) {
  .mh-nav {
    grid-template-columns: 1fr auto;
    padding: 1rem 5%;
  }

  .mh-nav-links {
    display: none;
  }
}
`,$n=[{title:"Inventory",description:"Track stock levels, movement, and replenishment with confidence.",link:"/inventory-management",icon:a.jsxs("svg",{width:"28",height:"28",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round",children:[a.jsx("path",{d:"M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"}),a.jsx("polyline",{points:"3.27 6.96 12 12.01 20.73 6.96"}),a.jsx("line",{x1:"12",y1:"22.08",x2:"12",y2:"12"})]})},{title:"Point of Sale",description:"Sell faster with connected checkout, payments, and receipts.",link:"/point-of-sale",icon:a.jsxs("svg",{width:"28",height:"28",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round",children:[a.jsx("rect",{x:"2",y:"3",width:"20",height:"14",rx:"2"}),a.jsx("line",{x1:"8",y1:"21",x2:"16",y2:"21"}),a.jsx("line",{x1:"12",y1:"17",x2:"12",y2:"21"}),a.jsx("path",{d:"M6 8h.01M9 8h.01"}),a.jsx("path",{d:"M6 11h12"})]})},{title:"Accounting",description:"Manage invoicing, billing, receivables, and finance workflows.",link:"/invoicing-accounting",icon:a.jsxs("svg",{width:"28",height:"28",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round",children:[a.jsx("path",{d:"M4 5.5h16"}),a.jsx("path",{d:"M4 18.5h16"}),a.jsx("rect",{x:"4",y:"3",width:"16",height:"18",rx:"2"}),a.jsx("path",{d:"M8 9h8"}),a.jsx("path",{d:"M8 13h3"}),a.jsx("path",{d:"M15.5 12l1.5 1.5 2.5-3"}),a.jsx("path",{d:"M8 17h5"})]})},{title:"Business Reports",description:"Turn daily store activity into clearer reporting and insight.",link:"/business-reports",icon:a.jsxs("svg",{width:"28",height:"28",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round",children:[a.jsx("path",{d:"M4 19h16"}),a.jsx("path",{d:"M7 16V10"}),a.jsx("path",{d:"M12 16V6"}),a.jsx("path",{d:"M17 16v-4"}),a.jsx("path",{d:"M5 8.5l4-3 3 2 5-3.5"}),a.jsx("path",{d:"M15 4h2.5v2.5"})]})},{title:"Credit & Cashflow Management",description:"Explore the upcoming tools for balances, due dates, and cash visibility.",link:"/credit-cashflow-management",icon:a.jsxs("svg",{width:"28",height:"28",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round",children:[a.jsx("circle",{cx:"9",cy:"21",r:"1"}),a.jsx("circle",{cx:"20",cy:"21",r:"1"}),a.jsx("path",{d:"M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"})]})},{title:"Online & Offline Sync",description:"Keep POS running through internet issues and sync later.",link:"/online-offline-sync",icon:a.jsxs("svg",{width:"28",height:"28",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round",children:[a.jsx("rect",{x:"5",y:"2",width:"14",height:"20",rx:"2",ry:"2"}),a.jsx("line",{x1:"12",y1:"18",x2:"12.01",y2:"18"})]})}],Kn=()=>{const[e,t]=c.useState(!1),n=c.useMemo(()=>({how:"/#how",pricing:"/#pricing",testimonials:"/#testimonials"}),[]);return a.jsxs(a.Fragment,{children:[a.jsx("style",{children:Un}),a.jsxs(B.nav,{className:"mh-nav",initial:{y:-60,opacity:0},animate:{y:0,opacity:1},transition:{duration:.5,ease:"easeOut"},children:[a.jsx(T,{to:"/",className:"mh-logo","aria-label":"MicroBiz home",children:a.jsx(B.img,{src:kt,alt:"MicroBiz",className:"mh-logo-img",initial:{x:-28,opacity:0},animate:{x:0,opacity:1},transition:{duration:.65,delay:.18,ease:"easeOut"}})}),a.jsxs("ul",{className:"mh-nav-links",children:[a.jsxs("li",{className:"mh-nav-item mh-nav-item--mega",onMouseEnter:()=>t(!0),onMouseLeave:()=>t(!1),onFocus:()=>t(!0),onBlur:s=>{s.currentTarget.contains(s.relatedTarget)||t(!1)},children:[a.jsxs("button",{type:"button",className:"mh-nav-menu-trigger","aria-expanded":e,"aria-haspopup":"true",onClick:()=>t(s=>!s),children:["Features",a.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:a.jsx("polyline",{points:"6 9 12 15 18 9"})})]}),a.jsx(Fe,{children:e&&a.jsxs(B.div,{className:"mh-mega-menu",initial:{opacity:0,y:10},animate:{opacity:1,y:0},exit:{opacity:0,y:8},transition:{duration:.18,ease:"easeOut"},children:[a.jsxs("div",{className:"mh-mega-menu-intro",children:[a.jsx("span",{className:"mh-mega-menu-label",children:"Explore Features"}),a.jsx("h3",{children:"Everything MicroBiz brings into one retail workflow."}),a.jsx("p",{children:"Open any feature page to see how it supports day-to-day store operations."})]}),a.jsx("div",{className:"mh-mega-menu-grid",children:$n.map(s=>a.jsxs(T,{to:s.link,className:"mh-mega-menu-card",onClick:()=>t(!1),children:[a.jsx("span",{className:"mh-mega-menu-icon",children:s.icon}),a.jsxs("span",{className:"mh-mega-menu-copy",children:[a.jsx("strong",{children:s.title}),a.jsx("span",{children:s.description})]})]},s.title))})]})})]}),a.jsx("li",{children:a.jsx("a",{href:n.how,children:"How It Works"})}),a.jsx("li",{children:a.jsx("a",{href:n.pricing,children:"Pricing"})}),a.jsx("li",{children:a.jsx("a",{href:n.testimonials,children:"Reviews"})}),a.jsx("li",{children:a.jsx(T,{to:"/login",className:"mh-nav-signin",children:"Sign In"})}),a.jsx("li",{children:a.jsx(T,{to:"/register",className:"mh-nav-cta",children:"Start Free →"})})]})]})]})},qn=()=>{const{pathname:e}=Jt(),t=e==="/"||e==="/landing",n=t?"#features":"/#features",s=t?"#pricing":"/#pricing",i=t?"#how":"/#how",o=t?"#testimonials":"/#testimonials";return a.jsxs(a.Fragment,{children:[a.jsxs(B.footer,{className:"mf-footer",initial:{opacity:0},whileInView:{opacity:1},viewport:{once:!0},transition:{duration:.6},children:[a.jsx("span",{className:"mf-footer-logo",children:a.jsx("img",{src:kt,alt:"MicroBiz",style:{height:"28px",objectFit:"contain"}})}),a.jsxs("ul",{className:"mf-footer-links",children:[a.jsx("li",{children:a.jsx("a",{href:n,children:"Learning Hub"})}),a.jsx("li",{children:a.jsx("a",{href:s,children:"Accounting"})}),a.jsx("li",{children:a.jsx("a",{href:i,children:"Security"})}),a.jsx("li",{children:a.jsx("a",{href:o,children:"Business Reports"})})]}),a.jsx("span",{className:"mf-footer-copy",children:"© 2026 MicroBiz. All rights reserved."})]}),a.jsx("style",{children:`
        .mf-footer {
          background: #f4f6f9;
          border-top: 1px solid #e2e8f0;
          padding: 3rem 5%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .mf-footer-logo {
          display: flex;
          align-items: center;
        }

        .mf-footer-links {
          display: flex;
          gap: 2rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .mf-footer-links a {
          text-decoration: none;
          color: #5a6a7e;
          font-size: 0.85rem;
          transition: color 0.2s;
        }

        .mf-footer-links a:hover {
          color: #0B2247;
        }

        .mf-footer-copy {
          font-size: 0.8rem;
          color: #5a6a7e;
        }

        @media (max-width: 900px) {
          .mf-footer {
            flex-direction: column;
            text-align: center;
          }
        }
      `})]})};export{Fe as A,Kn as M,qn as a,B as m};
