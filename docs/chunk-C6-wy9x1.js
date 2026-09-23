import"./chunk-D-5kCQMI.js";import{A as Hn,Br as xC,Ct as Sh,Er as tu,G as KC,Gr as yC,It as X1,Jn as mC,Pt as Wh,Rn as iu,Sr as tI,St as S,Tr as tn,Wr as xv,Y as Kl,Zt as _D,_ as Fw,_t as Ql,a as Av,at as Nh,bn as fh,ct as Oh,d as D,f as DC,g as Fh,i as Ao,it as Mh,kt as Vh,on as dC,ot as Ni,sn as dg,ut as P,x as Gh}from"./chunk-Cjg0Z6Uc.js";import{c as xe,r as G$1}from"./chunk-DKu-rEZo.js";var G=[`determinateSpinner`];function U(n,t){if(n&1&&(Ql(),Ni(0,`svg`,11),Nh(1,`circle`,12),iu()),n&2){let e=dC();Sh(`viewBox`,e._viewBox()),_D(),Gh(`stroke-dasharray`,e._strokeCircumference(),`px`)(`stroke-dashoffset`,e._strokeCircumference()/2,`px`)(`stroke-width`,e._circleStrokeWidth(),`%`),Sh(`r`,e._circleRadius())}}var q=new S(`mat-progress-spinner-default-options`,{providedIn:`root`,factory:()=>({diameter:j})});var j=100;var K=10;var $=(()=>{class n{_elementRef=D(Hn);_noopAnimations;get color(){return this._color||this._defaultColor}set color(e){this._color=e}_color;_defaultColor=`primary`;_determinateCircle;constructor(){let e=D(q),i=G$1(),r=this._elementRef.nativeElement;this._noopAnimations=i===`di-disabled`&&!!e&&!e._forceAnimations,this.mode=r.nodeName.toLowerCase()===`mat-spinner`?`indeterminate`:`determinate`,!this._noopAnimations&&i===`reduced-motion`&&r.classList.add(`mat-progress-spinner-reduced-motion`),e&&(e.color&&(this.color=this._defaultColor=e.color),e.diameter&&(this.diameter=e.diameter),e.strokeWidth&&(this.strokeWidth=e.strokeWidth))}mode;get value(){return this.mode===`determinate`?this._value:0}set value(e){this._value=Math.max(0,Math.min(100,e||0))}_value=0;get diameter(){return this._diameter}set diameter(e){this._diameter=e||0}_diameter=j;get strokeWidth(){return this._strokeWidth??this.diameter/10}set strokeWidth(e){this._strokeWidth=e||0}_strokeWidth;_circleRadius(){return(this.diameter-K)/2}_viewBox(){let e=this._circleRadius()*2+this.strokeWidth;return`0 0 ${e} ${e}`}_strokeCircumference(){return 2*Math.PI*this._circleRadius()}_strokeDashOffset(){return this.mode===`determinate`?this._strokeCircumference()*(100-this._value)/100:null}_circleStrokeWidth(){return this.strokeWidth/this.diameter*100}static ɵfac=function(i){return new(i||n)};static ɵcmp=tI({type:n,selectors:[[`mat-progress-spinner`],[`mat-spinner`]],viewQuery:function(i,r){if(i&1&&Vh(G,5),i&2){let s;mC(s=yC())&&(r._determinateCircle=s.first)}},hostAttrs:[`role`,`progressbar`,`tabindex`,`-1`,1,`mat-mdc-progress-spinner`,`mdc-circular-progress`],hostVars:18,hostBindings:function(i,r){i&2&&(Sh(`aria-valuemin`,0)(`aria-valuemax`,100)(`aria-valuenow`,r.mode===`determinate`?r.value:null)(`mode`,r.mode),xC(`mat-`+r.color),Gh(`width`,r.diameter,`px`)(`height`,r.diameter,`px`)(`--%NS%mat-progress-spinner-size`,r.diameter+`px`)(`--%NS%mat-progress-spinner-active-indicator-width`,r.diameter+`px`),Wh(`_mat-animation-noopable`,r._noopAnimations)(`mdc-circular-progress--indeterminate`,r.mode===`indeterminate`))},inputs:{color:`color`,mode:`mode`,value:[2,`value`,`value`,X1],diameter:[2,`diameter`,`diameter`,X1],strokeWidth:[2,`strokeWidth`,`strokeWidth`,X1]},exportAs:[`matProgressSpinner`],decls:14,vars:11,consts:[[`circle`,``],[`determinateSpinner`,``],[`aria-hidden`,`true`,1,`mdc-circular-progress__determinate-container`],[`xmlns`,`http://www.w3.org/2000/svg`,`focusable`,`false`,1,`mdc-circular-progress__determinate-circle-graphic`],[`cx`,`50%`,`cy`,`50%`,1,`mdc-circular-progress__determinate-circle`],[`aria-hidden`,`true`,1,`mdc-circular-progress__indeterminate-container`],[1,`mdc-circular-progress__spinner-layer`],[1,`mdc-circular-progress__circle-clipper`,`mdc-circular-progress__circle-left`],[3,`ngTemplateOutlet`],[1,`mdc-circular-progress__gap-patch`],[1,`mdc-circular-progress__circle-clipper`,`mdc-circular-progress__circle-right`],[`xmlns`,`http://www.w3.org/2000/svg`,`focusable`,`false`,1,`mdc-circular-progress__indeterminate-circle-graphic`],[`cx`,`50%`,`cy`,`50%`]],template:function(i,r){if(i&1&&(fh(0,U,2,8,`ng-template`,null,0,KC),Ni(2,`div`,2,1),Ql(),Ni(4,`svg`,3),Nh(5,`circle`,4),iu()(),Kl(),Ni(6,`div`,5)(7,`div`,6)(8,`div`,7),Oh(9,8),iu(),Ni(10,`div`,9),Oh(11,8),iu(),Ni(12,`div`,10),Oh(13,8),iu()()()),i&2){let s=DC(1);_D(4),Sh(`viewBox`,r._viewBox()),_D(),Gh(`stroke-dasharray`,r._strokeCircumference(),`px`)(`stroke-dashoffset`,r._strokeDashOffset(),`px`)(`stroke-width`,r._circleStrokeWidth(),`%`),Sh(`r`,r._circleRadius()),_D(4),Mh(`ngTemplateOutlet`,s),_D(2),Mh(`ngTemplateOutlet`,s),_D(2),Mh(`ngTemplateOutlet`,s)}},dependencies:[Fw],styles:[`.mat-mdc-progress-spinner {
  --%NS%mat-progress-spinner-animation-multiplier: 1;
  display: block;
  overflow: hidden;
  line-height: 0;
  position: relative;
  direction: ltr;
  transition: opacity 250ms cubic-bezier(0.4, 0, 0.6, 1);
}
.mat-mdc-progress-spinner circle {
  stroke-width: var(--%NS%mat-progress-spinner-active-indicator-width, 4px);
}
.mat-mdc-progress-spinner._mat-animation-noopable, .mat-mdc-progress-spinner._mat-animation-noopable .mdc-circular-progress__determinate-circle {
  transition: none !important;
}
.mat-mdc-progress-spinner._mat-animation-noopable .mdc-circular-progress__indeterminate-circle-graphic,
.mat-mdc-progress-spinner._mat-animation-noopable .mdc-circular-progress__spinner-layer,
.mat-mdc-progress-spinner._mat-animation-noopable .mdc-circular-progress__indeterminate-container {
  animation: none !important;
}
.mat-mdc-progress-spinner._mat-animation-noopable .mdc-circular-progress__indeterminate-container circle {
  stroke-dasharray: 0 !important;
}
@media (forced-colors: active) {
  .mat-mdc-progress-spinner .mdc-circular-progress__indeterminate-circle-graphic,
  .mat-mdc-progress-spinner .mdc-circular-progress__determinate-circle {
    stroke: currentColor;
    stroke: CanvasText;
  }
}

.mat-progress-spinner-reduced-motion {
  --%NS%mat-progress-spinner-animation-multiplier: 1.25;
}

.mdc-circular-progress__determinate-container,
.mdc-circular-progress__indeterminate-circle-graphic,
.mdc-circular-progress__indeterminate-container,
.mdc-circular-progress__spinner-layer {
  position: absolute;
  width: 100%;
  height: 100%;
}

.mdc-circular-progress__determinate-container {
  transform: rotate(-90deg);
}
.mdc-circular-progress--indeterminate .mdc-circular-progress__determinate-container {
  opacity: 0;
}

.mdc-circular-progress__indeterminate-container {
  font-size: 0;
  letter-spacing: 0;
  white-space: nowrap;
  opacity: 0;
}
.mdc-circular-progress--indeterminate .mdc-circular-progress__indeterminate-container {
  opacity: 1;
  animation: mdc-circular-progress-container-rotate calc(1568.2352941176ms * var(--%NS%mat-progress-spinner-animation-multiplier)) linear infinite;
}

.mdc-circular-progress__determinate-circle-graphic,
.mdc-circular-progress__indeterminate-circle-graphic {
  fill: transparent;
}

.mat-mdc-progress-spinner .mdc-circular-progress__determinate-circle,
.mat-mdc-progress-spinner .mdc-circular-progress__indeterminate-circle-graphic {
  stroke: var(--%NS%mat-progress-spinner-active-indicator-color, var(--%NS%mat-sys-primary));
}
@media (forced-colors: active) {
  .mat-mdc-progress-spinner .mdc-circular-progress__determinate-circle,
  .mat-mdc-progress-spinner .mdc-circular-progress__indeterminate-circle-graphic {
    stroke: CanvasText;
  }
}

.mdc-circular-progress__determinate-circle {
  transition: stroke-dashoffset 500ms cubic-bezier(0, 0, 0.2, 1);
}

.mdc-circular-progress__gap-patch {
  position: absolute;
  top: 0;
  left: 47.5%;
  box-sizing: border-box;
  width: 5%;
  height: 100%;
  overflow: hidden;
}

.mdc-circular-progress__gap-patch .mdc-circular-progress__indeterminate-circle-graphic {
  left: -900%;
  width: 2000%;
  transform: rotate(180deg);
}
.mdc-circular-progress__circle-clipper .mdc-circular-progress__indeterminate-circle-graphic {
  width: 200%;
}
.mdc-circular-progress__circle-right .mdc-circular-progress__indeterminate-circle-graphic {
  left: -100%;
}
.mdc-circular-progress--indeterminate .mdc-circular-progress__circle-left .mdc-circular-progress__indeterminate-circle-graphic {
  animation: mdc-circular-progress-left-spin calc(1333ms * var(--%NS%mat-progress-spinner-animation-multiplier)) cubic-bezier(0.4, 0, 0.2, 1) infinite both;
}
.mdc-circular-progress--indeterminate .mdc-circular-progress__circle-right .mdc-circular-progress__indeterminate-circle-graphic {
  animation: mdc-circular-progress-right-spin calc(1333ms * var(--%NS%mat-progress-spinner-animation-multiplier)) cubic-bezier(0.4, 0, 0.2, 1) infinite both;
}

.mdc-circular-progress__circle-clipper {
  display: inline-flex;
  position: relative;
  width: 50%;
  height: 100%;
  overflow: hidden;
}

.mdc-circular-progress--indeterminate .mdc-circular-progress__spinner-layer {
  animation: mdc-circular-progress-spinner-layer-rotate calc(5332ms * var(--%NS%mat-progress-spinner-animation-multiplier)) cubic-bezier(0.4, 0, 0.2, 1) infinite both;
}

@keyframes mdc-circular-progress-container-rotate {
  to {
    transform: rotate(360deg);
  }
}
@keyframes mdc-circular-progress-spinner-layer-rotate {
  12.5% {
    transform: rotate(135deg);
  }
  25% {
    transform: rotate(270deg);
  }
  37.5% {
    transform: rotate(405deg);
  }
  50% {
    transform: rotate(540deg);
  }
  62.5% {
    transform: rotate(675deg);
  }
  75% {
    transform: rotate(810deg);
  }
  87.5% {
    transform: rotate(945deg);
  }
  100% {
    transform: rotate(1080deg);
  }
}
@keyframes mdc-circular-progress-left-spin {
  from {
    transform: rotate(265deg);
  }
  50% {
    transform: rotate(130deg);
  }
  to {
    transform: rotate(265deg);
  }
}
@keyframes mdc-circular-progress-right-spin {
  from {
    transform: rotate(-265deg);
  }
  50% {
    transform: rotate(-130deg);
  }
  to {
    transform: rotate(-265deg);
  }
}
`],encapsulation:2})}return n})();var F=(()=>{class n{static ɵfac=function(i){return new(i||n)};static ɵmod=tu({type:n});static ɵinj=Ao({imports:[xe]})}return n})();var _=class n{constructor(){this.addListener()}cursorXExport=0;cursorYExport=0;listenerExistence=!1;addListener(){document.addEventListener(`mousemove`,t=>{this.cursorXExport=t.clientX,this.cursorYExport=t.clientY}),this.listenerExistence=!this.listenerExistence}removeListener(){document.removeEventListener(`mousemove`,t=>{this.cursorXExport=t.clientX,this.cursorYExport=t.clientY}),this.listenerExistence=!this.listenerExistence}addListenerOnce(){document.addEventListener(`mousemove`,t=>{this.cursorXExport=t.clientX,this.cursorYExport=t.clientY},{once:!0})}static ɵfac=function(e){return new(e||n)};static ɵprov=P({token:n,factory:n.ɵfac,providedIn:`root`})};var V=class n{constructor(t,e){this.$setProgressSpinnerService=t;this.$cursorPositionListener=e;this.$cursorPositionListener.listenerExistence===!0&&(this.mouseX=this.$cursorPositionListener.cursorXExport+this.difX,this.mouseY=this.$cursorPositionListener.cursorYExport+this.difY)}$setProgressSpinnerService;$cursorPositionListener;mouseX=0;mouseY=0;clientX=0;clientY=0;difX=15;difY=15;initialWidth=window.innerWidth;innerHeight=window.innerHeight;onMouseMove(t){this.clientX=t.clientX,this.clientY=t.clientY,this.mouseX=t.clientX+this.difX,this.mouseY=t.clientY+this.difY}onResize(t){let e=window.innerWidth,i=window.innerHeight,r=(e-this.initialWidth)/this.initialWidth,s=(i-this.innerHeight)/this.innerHeight;if(this.difX=this.difX+this.difX*r,this.difY=this.difY+this.difY*s,this.initialWidth=e,this.innerHeight=i,this.$setProgressSpinnerService.isShowSpinner()){let Q=new MouseEvent(`mousemove`,{clientX:this.clientX+this.clientX*r,clientY:this.clientY+this.clientY*s});document.dispatchEvent(Q)}}static ɵfac=function(e){return new(e||n)(tn(dg),tn(_))};static ɵcmp=tI({type:n,selectors:[[`progress-spinner`]],hostBindings:function(e,i){e&1&&Fh(`mousemove`,function(s){return i.onMouseMove(s)},Av)(`resize`,function(s){return i.onResize(s)},xv)},decls:1,vars:4,consts:[[2,`position`,`fixed`,`z-index`,`1001`,`width`,`15px`,`height`,`15px`]],template:function(e,i){e&1&&Nh(0,`mat-spinner`,0),e&2&&Gh(`left`,i.mouseX,`px`)(`top`,i.mouseY,`px`)},dependencies:[F,$],encapsulation:2})};export{V as ProgressSpinner};