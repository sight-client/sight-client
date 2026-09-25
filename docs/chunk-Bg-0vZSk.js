import{t as r}from"./chunk-D-5kCQMI.js";import{$ as Nn$1,$n as nw,An as it,Ct as Wg,En as he$1,Er as tP,Mn as je$1,Nt as Y$1,Or as tm,Ot as XI,Qt as cu,R as Ju,Rt as Z1,Tn as hC,Wt as ag,Yt as cd,Z as Nh,Zn as nu,_ as Di,a as AC,an as eP,dt as Rr,en as dn,et as Oh,fr as qh,ft as S,in as eC,ir as ow,jt as Xu,k as Hn,lr as pu,m as D,mn as fh,nn as ds,on as ea,pt as SD,qn as nI,qt as au,rt as P,s as Ao,st as Q,vn as gC,w as Gg,wn as gs,wt as Wi,xr as se,xt as Vn,z as K,zn as le}from"./chunk-BI-7k2hW.js";import{c as xe$1,n as C,o as ue$1}from"./chunk-BEwQrPyG.js";import{$ as qn,P as Wo,S as Q$1,b as Oi,k as U,x as Ot}from"./chunk-B9x5T80Q.js";import{B as fe$1,D as U$1,E as TR,H as iIe,M as Y1,Q as si,R as d,V as fh$1,W as kt,X as rIe,Y as qg,at as ww,b as P1,d as Hi,f as Ht,j as We$1,lt as z,o as Ei,p as IC,q as oo,s as Ew,tt as te,v as Nn$2,w as Sl,y as P$1,z as fD}from"./chunk-Dy1bQUm5.js";import{a as fe$2,c as jh,i as V4,l as wi,n as B4,r as Ca,t as Aa}from"./chunk-DL_uYghB.js";var Ie={capture:!0};var De=[`focus`,`mousedown`,`mouseenter`,`touchstart`];var Tt=`mat-ripple-loader-uninitialized`;var Lt=`mat-ripple-loader-class-name`;var ue=`mat-ripple-loader-centered`;var vt=`mat-ripple-loader-disabled`;var be=(()=>{class s{_document=D(je$1);_animationsDisabled=ue$1();_globalRippleOptions=D(jh,{optional:!0});_platform=D(C);_ngZone=D(le);_injector=D(se);_eventCleanups;_hosts=new Map;constructor(){let t=D(Rr).createRenderer(null,null);this._eventCleanups=this._ngZone.runOutsideAngular(()=>De.map(e=>t.listen(this._document,e,this._onInteraction,Ie)))}ngOnDestroy(){let t=this._hosts.keys();for(let e of t)this.destroyRipple(e);this._eventCleanups.forEach(e=>e())}configureRipple(t,e){t.setAttribute(Tt,this._globalRippleOptions?.namespace??``),(e.className||!t.hasAttribute(Lt))&&t.setAttribute(Lt,e.className||``),e.centered&&t.setAttribute(ue,``),e.disabled&&t.setAttribute(vt,``)}setDisabled(t,e){let n=this._hosts.get(t);n?(n.target.rippleDisabled=e,!e&&!n.hasSetUpEvents&&(n.hasSetUpEvents=!0,n.renderer.setupTriggerEvents(t))):e?t.setAttribute(vt,``):t.removeAttribute(vt)}_onInteraction=t=>{let e=U(t);if(e instanceof HTMLElement){let n=e.closest(`[${Tt}="${this._globalRippleOptions?.namespace??``}"]`);n&&this._createRipple(n)}};_createRipple(t){if(!this._document||this._hosts.has(t))return;t.querySelector(`.mat-ripple`)?.remove();let e=this._document.createElement(`span`);e.classList.add(`mat-ripple`,t.getAttribute(Lt)),t.append(e);let n=this._globalRippleOptions,i=this._animationsDisabled?0:n?.animation?.enterDuration??Aa.enterDuration,o=this._animationsDisabled?0:n?.animation?.exitDuration??Aa.exitDuration,r={rippleDisabled:this._animationsDisabled||n?.disabled||t.hasAttribute(vt),rippleConfig:{centered:t.hasAttribute(ue),terminateOnPointerUp:n?.terminateOnPointerUp,animation:{enterDuration:i,exitDuration:o}}},l=new fe$2(r,this._ngZone,e,this._platform,this._injector),u=!r.rippleDisabled;u&&l.setupTriggerEvents(t),this._hosts.set(t,{target:r,renderer:l,hasSetUpEvents:u}),t.removeAttribute(Tt)}destroyRipple(t){let e=this._hosts.get(t);e&&(e.renderer._removeTriggerEvents(),this._hosts.delete(t))}static ɵfac=function(e){return new(e||s)};static ɵprov=Vn({token:s,factory:s.ɵfac})}return s})();var Me=[`*`,[[``,`progressIndicator`,``]]];var Ae=[`*`,`[progressIndicator]`];function ke(s,a){s&1&&(au(0,`div`,1),gC(1,1),cu())}var Pe=new S(`MAT_BUTTON_CONFIG`);function pe(s){return s==null?void 0:tP(s)}var It=(()=>{class s{_elementRef=D(Hn);_ngZone=D(le);_animationsDisabled=ue$1();_config=D(Pe,{optional:!0});_focusMonitor=D(Ot);_cleanupClick;_renderer=D(Di);_rippleLoader=D(be);_isAnchor;_isFab=!1;color;get disableRipple(){return this._disableRipple}set disableRipple(t){this._disableRipple=t,this._updateRippleDisabled()}_disableRipple=!1;get disabled(){return this._disabled}set disabled(t){this._disabled=t,this._updateRippleDisabled()}_disabled=!1;ariaDisabled;disabledInteractive;tabIndex;set _tabindex(t){this.tabIndex=t}showProgress=Z1(!1,{transform:eP});constructor(){D(Q$1).load(B4);let t=this._elementRef.nativeElement;this._isAnchor=t.tagName===`A`,this.disabledInteractive=this._config?.disabledInteractive??!1,this.color=this._config?.color??null,this._rippleLoader?.configureRipple(t,{className:`mat-mdc-button-ripple`})}ngAfterViewInit(){this._focusMonitor.monitor(this._elementRef,!0),this._isAnchor&&this._setupAsAnchor()}ngOnDestroy(){this._cleanupClick?.(),this._focusMonitor.stopMonitoring(this._elementRef),this._rippleLoader?.destroyRipple(this._elementRef.nativeElement)}focus(t=`program`,e){t?this._focusMonitor.focusVia(this._elementRef.nativeElement,t,e):this._elementRef.nativeElement.focus(e)}_getAriaDisabled(){return this.ariaDisabled!=null?this.ariaDisabled:this._isAnchor?this.disabled||null:this.disabled&&this.disabledInteractive?!0:null}_getDisabledAttribute(){return this.disabledInteractive||!this.disabled?null:!0}_updateRippleDisabled(){this._rippleLoader?.setDisabled(this._elementRef.nativeElement,this.disableRipple||this.disabled)}_getTabIndex(){return this._isAnchor?this.disabled&&!this.disabledInteractive?-1:this.tabIndex:this.tabIndex}_setupAsAnchor(){this._cleanupClick=this._ngZone.runOutsideAngular(()=>this._renderer.listen(this._elementRef.nativeElement,`click`,t=>{this.disabled&&(t.preventDefault(),t.stopImmediatePropagation())}))}static ɵfac=function(e){return new(e||s)};static ɵdir=Wi({type:s,hostAttrs:[1,`mat-mdc-button-base`],hostVars:15,hostBindings:function(e,n){e&2&&(Nh(`disabled`,n._getDisabledAttribute())(`aria-disabled`,n._getAriaDisabled())(`tabindex`,n._getTabIndex()),AC(n.color?`mat-`+n.color:``),qh(`mat-mdc-button-progress-indicator-shown`,n.showProgress())(`mat-mdc-button-disabled`,n.disabled)(`mat-mdc-button-disabled-interactive`,n.disabledInteractive)(`mat-unthemed`,!n.color)(`_mat-animation-noopable`,n._animationsDisabled))},inputs:{color:`color`,disableRipple:[2,`disableRipple`,`disableRipple`,eP],disabled:[2,`disabled`,`disabled`,eP],ariaDisabled:[2,`aria-disabled`,`ariaDisabled`,eP],disabledInteractive:[2,`disabledInteractive`,`disabledInteractive`,eP],tabIndex:[2,`tabIndex`,`tabIndex`,pe],_tabindex:[2,`tabindex`,`_tabindex`,pe],showProgress:[1,`showProgress`]}})}return s})();var Re=(()=>{class s extends It{constructor(){super(),this._rippleLoader.configureRipple(this._elementRef.nativeElement,{centered:!0})}static ɵfac=function(e){return new(e||s)};static ɵcmp=nI({type:s,selectors:[[`button`,`mat-icon-button`,``],[`a`,`mat-icon-button`,``],[`button`,`matIconButton`,``],[`a`,`matIconButton`,``]],hostAttrs:[1,`mdc-icon-button`,`mat-mdc-icon-button`],exportAs:[`matButton`,`matAnchor`],features:[fh],ngContentSelectors:Ae,decls:5,vars:1,consts:[[1,`mat-mdc-button-persistent-ripple`,`mdc-icon-button__ripple`],[1,`mat-mdc-button-progress-indicator-container`],[1,`mat-focus-indicator`],[1,`mat-mdc-button-touch-target`]],template:function(e,n){e&1&&(hC(Me),Oh(0,`span`,0),gC(1),XI(2,ke,2,0,`div`,1),Oh(3,`span`,2)(4,`span`,3)),e&2&&(SD(2),eC(n.showProgress()?2:-1))},styles:[`.mat-mdc-icon-button {
  -webkit-user-select: none;
  user-select: none;
  display: inline-block;
  position: relative;
  box-sizing: border-box;
  border: none;
  outline: none;
  background-color: transparent;
  fill: currentColor;
  text-decoration: none;
  cursor: pointer;
  z-index: 0;
  overflow: visible;
  border-radius: var(--%NS%mat-icon-button-container-shape, var(--%NS%mat-sys-corner-full, 50%));
  flex-shrink: 0;
  text-align: center;
  width: var(--%NS%mat-icon-button-state-layer-size, 40px);
  height: var(--%NS%mat-icon-button-state-layer-size, 40px);
  padding: calc(calc(var(--%NS%mat-icon-button-state-layer-size, 40px) - var(--%NS%mat-icon-button-icon-size, 24px)) / 2);
  font-size: var(--%NS%mat-icon-button-icon-size, 24px);
  color: var(--%NS%mat-icon-button-icon-color, var(--%NS%mat-sys-on-surface-variant));
  -webkit-tap-highlight-color: transparent;
}
.mat-mdc-icon-button .mat-mdc-button-ripple,
.mat-mdc-icon-button .mat-mdc-button-persistent-ripple,
.mat-mdc-icon-button .mat-mdc-button-persistent-ripple::before {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  pointer-events: none;
  border-radius: inherit;
}
.mat-mdc-icon-button .mat-mdc-button-ripple {
  overflow: hidden;
}
.mat-mdc-icon-button .mat-mdc-button-persistent-ripple::before {
  content: "";
  opacity: 0;
}
.mat-mdc-icon-button .mdc-button__label,
.mat-mdc-icon-button .mat-icon {
  z-index: 1;
  position: relative;
}
.mat-mdc-icon-button .mat-focus-indicator {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  border-radius: inherit;
}
.mat-mdc-icon-button:focus-visible > .mat-focus-indicator::before {
  content: "";
  border-radius: inherit;
}
.mat-mdc-icon-button .mat-ripple-element {
  background-color: var(--%NS%mat-icon-button-ripple-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface-variant) calc(var(--%NS%mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-icon-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--%NS%mat-icon-button-state-layer-color, var(--%NS%mat-sys-on-surface-variant));
}
.mat-mdc-icon-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--%NS%mat-icon-button-disabled-state-layer-color, var(--%NS%mat-sys-on-surface-variant));
}
.mat-mdc-icon-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-icon-button-hover-state-layer-opacity, var(--%NS%mat-sys-hover-state-layer-opacity));
}
.mat-mdc-icon-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-icon-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-icon-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-icon-button-focus-state-layer-opacity, var(--%NS%mat-sys-focus-state-layer-opacity));
}
.mat-mdc-icon-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-icon-button-pressed-state-layer-opacity, var(--%NS%mat-sys-pressed-state-layer-opacity));
}
.mat-mdc-icon-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--%NS%mat-icon-button-touch-target-size, 48px);
  display: var(--%NS%mat-icon-button-touch-target-display, block);
  left: 50%;
  width: var(--%NS%mat-icon-button-touch-target-size, 48px);
  transform: translate(-50%, -50%);
}
.mat-mdc-icon-button._mat-animation-noopable {
  transition: none !important;
  animation: none !important;
}
.mat-mdc-icon-button[disabled], .mat-mdc-icon-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--%NS%mat-icon-button-disabled-icon-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 38%, transparent));
}
.mat-mdc-icon-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}
.mat-mdc-icon-button img,
.mat-mdc-icon-button svg {
  width: var(--%NS%mat-icon-button-icon-size, 24px);
  height: var(--%NS%mat-icon-button-icon-size, 24px);
  vertical-align: baseline;
}
.mat-mdc-icon-button .mat-mdc-button-progress-indicator-container .mdc-circular-progress__determinate-circle-graphic {
  width: inherit;
  height: inherit;
}
.mat-mdc-icon-button .mat-mdc-button-progress-indicator-container .mdc-circular-progress__indeterminate-circle-graphic {
  height: 100%;
}
.mat-mdc-icon-button .mat-mdc-button-persistent-ripple {
  border-radius: var(--%NS%mat-icon-button-container-shape, var(--%NS%mat-sys-corner-full, 50%));
}
.mat-mdc-icon-button[hidden] {
  display: none;
}
.mat-mdc-icon-button.mat-unthemed:not(.mdc-ripple-upgraded):focus::before, .mat-mdc-icon-button.mat-primary:not(.mdc-ripple-upgraded):focus::before, .mat-mdc-icon-button.mat-accent:not(.mdc-ripple-upgraded):focus::before, .mat-mdc-icon-button.mat-warn:not(.mdc-ripple-upgraded):focus::before {
  background: transparent;
  opacity: 1;
}

.mat-mdc-button-progress-indicator-container {
  position: absolute;
  inset-inline-start: 0;
  inset-block-start: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.mat-mdc-button-progress-indicator-shown mat-icon {
  visibility: hidden;
}
`,`@media (forced-colors: active) {
  .mat-mdc-button:not(.mdc-button--outlined),
  .mat-mdc-unelevated-button:not(.mdc-button--outlined),
  .mat-mdc-raised-button:not(.mdc-button--outlined),
  .mat-mdc-outlined-button:not(.mdc-button--outlined),
  .mat-mdc-button-base.mat-tonal-button,
  .mat-mdc-icon-button.mat-mdc-icon-button,
  .mat-mdc-outlined-button .mdc-button__ripple {
    outline: solid 1px;
  }
}
`],encapsulation:2})}return s})();var Fe=[[[``,8,`material-icons`,3,`iconPositionEnd`,``],[`mat-icon`,3,`iconPositionEnd`,``],[``,`matButtonIcon`,``,3,`iconPositionEnd`,``]],`*`,[[``,`iconPositionEnd`,``,8,`material-icons`],[`mat-icon`,`iconPositionEnd`,``],[``,`matButtonIcon`,``,`iconPositionEnd`,``]],[[``,`progressIndicator`,``]]];var Ge=[`.material-icons:not([iconPositionEnd]), mat-icon:not([iconPositionEnd]), [matButtonIcon]:not([iconPositionEnd])`,`*`,`.material-icons[iconPositionEnd], mat-icon[iconPositionEnd], [matButtonIcon][iconPositionEnd]`,`[progressIndicator]`];function Oe(s,a){s&1&&(au(0,`div`,2),gC(1,3),cu())}var fe=new Map([[`text`,[`mat-mdc-button`]],[`filled`,[`mdc-button--unelevated`,`mat-mdc-unelevated-button`]],[`elevated`,[`mdc-button--raised`,`mat-mdc-raised-button`]],[`outlined`,[`mdc-button--outlined`,`mat-mdc-outlined-button`]],[`tonal`,[`mat-tonal-button`]]]);var wn=(()=>{class s extends It{get appearance(){return this._appearance}set appearance(t){this.setAppearance(t||this._config?.defaultAppearance||`text`)}_appearance=null;constructor(){super();let t=$e(this._elementRef.nativeElement);t&&this.setAppearance(t)}setAppearance(t){if(t===this._appearance)return;let e=this._elementRef.nativeElement.classList,n=this._appearance?fe.get(this._appearance):null,i=fe.get(t);n&&e.remove(...n),e.add(...i),this._appearance=t}static ɵfac=function(e){return new(e||s)};static ɵcmp=nI({type:s,selectors:[[`button`,`matButton`,``],[`a`,`matButton`,``],[`button`,`mat-button`,``],[`button`,`mat-raised-button`,``],[`button`,`mat-flat-button`,``],[`button`,`mat-stroked-button`,``],[`a`,`mat-button`,``],[`a`,`mat-raised-button`,``],[`a`,`mat-flat-button`,``],[`a`,`mat-stroked-button`,``]],hostAttrs:[1,`mdc-button`],inputs:{appearance:[0,`matButton`,`appearance`]},exportAs:[`matButton`,`matAnchor`],features:[fh],ngContentSelectors:Ge,decls:8,vars:5,consts:[[1,`mat-mdc-button-persistent-ripple`],[1,`mdc-button__label`],[1,`mat-mdc-button-progress-indicator-container`],[1,`mat-focus-indicator`],[1,`mat-mdc-button-touch-target`]],template:function(e,n){e&1&&(hC(Fe),Oh(0,`span`,0),gC(1),au(2,`span`,1),gC(3,1),cu(),gC(4,2),XI(5,Oe,2,0,`div`,2),Oh(6,`span`,3)(7,`span`,4)),e&2&&(qh(`mdc-button__ripple`,!n._isFab)(`mdc-fab__ripple`,n._isFab),SD(5),eC(n.showProgress()?5:-1))},styles:[`.mat-mdc-button-base {
  text-decoration: none;
}
.mat-mdc-button-base .mat-icon {
  min-height: fit-content;
  flex-shrink: 0;
}
@media (hover: none) {
  .mat-mdc-button-base:hover > span.mat-mdc-button-persistent-ripple::before {
    opacity: 0;
  }
}

.mdc-button {
  -webkit-user-select: none;
  user-select: none;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-width: 64px;
  border: none;
  outline: none;
  line-height: inherit;
  -webkit-appearance: none;
  overflow: visible;
  vertical-align: middle;
  background: transparent;
  padding: 0 8px;
}
.mdc-button::-moz-focus-inner {
  padding: 0;
  border: 0;
}
.mdc-button:active {
  outline: none;
}
.mdc-button:hover {
  cursor: pointer;
}
.mdc-button:disabled {
  cursor: default;
  pointer-events: none;
}
.mdc-button[hidden] {
  display: none;
}
.mdc-button .mdc-button__label {
  position: relative;
}

.mat-mdc-button {
  padding: 0 var(--%NS%mat-button-text-horizontal-padding, 12px);
  height: var(--%NS%mat-button-text-container-height, 40px);
  font-family: var(--%NS%mat-button-text-label-text-font, var(--%NS%mat-sys-label-large-font));
  font-size: var(--%NS%mat-button-text-label-text-size, var(--%NS%mat-sys-label-large-size));
  letter-spacing: var(--%NS%mat-button-text-label-text-tracking, var(--%NS%mat-sys-label-large-tracking));
  text-transform: var(--%NS%mat-button-text-label-text-transform);
  font-weight: var(--%NS%mat-button-text-label-text-weight, var(--%NS%mat-sys-label-large-weight));
}
.mat-mdc-button, .mat-mdc-button .mdc-button__ripple {
  border-radius: var(--%NS%mat-button-text-container-shape, var(--%NS%mat-sys-corner-full));
}
.mat-mdc-button:not(:disabled) {
  color: var(--%NS%mat-button-text-label-text-color, var(--%NS%mat-sys-primary));
}
.mat-mdc-button[disabled], .mat-mdc-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--%NS%mat-button-text-disabled-label-text-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 38%, transparent));
}
.mat-mdc-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}
.mat-mdc-button:has(.material-icons, mat-icon, [matButtonIcon]) {
  padding: 0 var(--%NS%mat-button-text-with-icon-horizontal-padding, 16px);
}
.mat-mdc-button > .mat-icon {
  margin-right: var(--%NS%mat-button-text-icon-spacing, 8px);
  margin-left: var(--%NS%mat-button-text-icon-offset, -4px);
}
[dir=rtl] .mat-mdc-button > .mat-icon {
  margin-right: var(--%NS%mat-button-text-icon-offset, -4px);
  margin-left: var(--%NS%mat-button-text-icon-spacing, 8px);
}
.mat-mdc-button .mdc-button__label + .mat-icon {
  margin-right: var(--%NS%mat-button-text-icon-offset, -4px);
  margin-left: var(--%NS%mat-button-text-icon-spacing, 8px);
}
[dir=rtl] .mat-mdc-button .mdc-button__label + .mat-icon {
  margin-right: var(--%NS%mat-button-text-icon-spacing, 8px);
  margin-left: var(--%NS%mat-button-text-icon-offset, -4px);
}
.mat-mdc-button .mat-ripple-element {
  background-color: var(--%NS%mat-button-text-ripple-color, color-mix(in srgb, var(--%NS%mat-sys-primary) calc(var(--%NS%mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--%NS%mat-button-text-state-layer-color, var(--%NS%mat-sys-primary));
}
.mat-mdc-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--%NS%mat-button-text-disabled-state-layer-color, var(--%NS%mat-sys-on-surface-variant));
}
.mat-mdc-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-text-hover-state-layer-opacity, var(--%NS%mat-sys-hover-state-layer-opacity));
}
.mat-mdc-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-text-focus-state-layer-opacity, var(--%NS%mat-sys-focus-state-layer-opacity));
}
.mat-mdc-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-text-pressed-state-layer-opacity, var(--%NS%mat-sys-pressed-state-layer-opacity));
}
.mat-mdc-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--%NS%mat-button-text-touch-target-size, 48px);
  display: var(--%NS%mat-button-text-touch-target-display, block);
  left: 0;
  right: 0;
  transform: translateY(-50%);
}

.mat-mdc-unelevated-button {
  transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);
  height: var(--%NS%mat-button-filled-container-height, 40px);
  font-family: var(--%NS%mat-button-filled-label-text-font, var(--%NS%mat-sys-label-large-font));
  font-size: var(--%NS%mat-button-filled-label-text-size, var(--%NS%mat-sys-label-large-size));
  letter-spacing: var(--%NS%mat-button-filled-label-text-tracking, var(--%NS%mat-sys-label-large-tracking));
  text-transform: var(--%NS%mat-button-filled-label-text-transform);
  font-weight: var(--%NS%mat-button-filled-label-text-weight, var(--%NS%mat-sys-label-large-weight));
  padding: 0 var(--%NS%mat-button-filled-horizontal-padding, 24px);
}
.mat-mdc-unelevated-button > .mat-icon {
  margin-right: var(--%NS%mat-button-filled-icon-spacing, 8px);
  margin-left: var(--%NS%mat-button-filled-icon-offset, -8px);
}
[dir=rtl] .mat-mdc-unelevated-button > .mat-icon {
  margin-right: var(--%NS%mat-button-filled-icon-offset, -8px);
  margin-left: var(--%NS%mat-button-filled-icon-spacing, 8px);
}
.mat-mdc-unelevated-button .mdc-button__label + .mat-icon {
  margin-right: var(--%NS%mat-button-filled-icon-offset, -8px);
  margin-left: var(--%NS%mat-button-filled-icon-spacing, 8px);
}
[dir=rtl] .mat-mdc-unelevated-button .mdc-button__label + .mat-icon {
  margin-right: var(--%NS%mat-button-filled-icon-spacing, 8px);
  margin-left: var(--%NS%mat-button-filled-icon-offset, -8px);
}
.mat-mdc-unelevated-button .mat-ripple-element {
  background-color: var(--%NS%mat-button-filled-ripple-color, color-mix(in srgb, var(--%NS%mat-sys-on-primary) calc(var(--%NS%mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-unelevated-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--%NS%mat-button-filled-state-layer-color, var(--%NS%mat-sys-on-primary));
}
.mat-mdc-unelevated-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--%NS%mat-button-filled-disabled-state-layer-color, var(--%NS%mat-sys-on-surface-variant));
}
.mat-mdc-unelevated-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-filled-hover-state-layer-opacity, var(--%NS%mat-sys-hover-state-layer-opacity));
}
.mat-mdc-unelevated-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-unelevated-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-unelevated-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-filled-focus-state-layer-opacity, var(--%NS%mat-sys-focus-state-layer-opacity));
}
.mat-mdc-unelevated-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-filled-pressed-state-layer-opacity, var(--%NS%mat-sys-pressed-state-layer-opacity));
}
.mat-mdc-unelevated-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--%NS%mat-button-filled-touch-target-size, 48px);
  display: var(--%NS%mat-button-filled-touch-target-display, block);
  left: 0;
  right: 0;
  transform: translateY(-50%);
}
.mat-mdc-unelevated-button:not(:disabled) {
  color: var(--%NS%mat-button-filled-label-text-color, var(--%NS%mat-sys-on-primary));
  background-color: var(--%NS%mat-button-filled-container-color, var(--%NS%mat-sys-primary));
}
.mat-mdc-unelevated-button, .mat-mdc-unelevated-button .mdc-button__ripple {
  border-radius: var(--%NS%mat-button-filled-container-shape, var(--%NS%mat-sys-corner-full));
}
.mat-mdc-unelevated-button .mat-mdc-button-progress-indicator-container {
  --%NS%mat-progress-spinner-active-indicator-color: var(--%NS%mat-button-filled-progress-active-indicator-color, var(--%NS%mat-sys-on-primary));
}
.mat-mdc-unelevated-button[disabled], .mat-mdc-unelevated-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--%NS%mat-button-filled-disabled-label-text-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 38%, transparent));
  background-color: var(--%NS%mat-button-filled-disabled-container-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 12%, transparent));
}
.mat-mdc-unelevated-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}

.mat-mdc-raised-button {
  transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--%NS%mat-button-protected-container-elevation-shadow, var(--%NS%mat-sys-level1));
  height: var(--%NS%mat-button-protected-container-height, 40px);
  font-family: var(--%NS%mat-button-protected-label-text-font, var(--%NS%mat-sys-label-large-font));
  font-size: var(--%NS%mat-button-protected-label-text-size, var(--%NS%mat-sys-label-large-size));
  letter-spacing: var(--%NS%mat-button-protected-label-text-tracking, var(--%NS%mat-sys-label-large-tracking));
  text-transform: var(--%NS%mat-button-protected-label-text-transform);
  font-weight: var(--%NS%mat-button-protected-label-text-weight, var(--%NS%mat-sys-label-large-weight));
  padding: 0 var(--%NS%mat-button-protected-horizontal-padding, 24px);
}
.mat-mdc-raised-button > .mat-icon {
  margin-right: var(--%NS%mat-button-protected-icon-spacing, 8px);
  margin-left: var(--%NS%mat-button-protected-icon-offset, -8px);
}
[dir=rtl] .mat-mdc-raised-button > .mat-icon {
  margin-right: var(--%NS%mat-button-protected-icon-offset, -8px);
  margin-left: var(--%NS%mat-button-protected-icon-spacing, 8px);
}
.mat-mdc-raised-button .mdc-button__label + .mat-icon {
  margin-right: var(--%NS%mat-button-protected-icon-offset, -8px);
  margin-left: var(--%NS%mat-button-protected-icon-spacing, 8px);
}
[dir=rtl] .mat-mdc-raised-button .mdc-button__label + .mat-icon {
  margin-right: var(--%NS%mat-button-protected-icon-spacing, 8px);
  margin-left: var(--%NS%mat-button-protected-icon-offset, -8px);
}
.mat-mdc-raised-button .mat-ripple-element {
  background-color: var(--%NS%mat-button-protected-ripple-color, color-mix(in srgb, var(--%NS%mat-sys-primary) calc(var(--%NS%mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-raised-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--%NS%mat-button-protected-state-layer-color, var(--%NS%mat-sys-primary));
}
.mat-mdc-raised-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--%NS%mat-button-protected-disabled-state-layer-color, var(--%NS%mat-sys-on-surface-variant));
}
.mat-mdc-raised-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-protected-hover-state-layer-opacity, var(--%NS%mat-sys-hover-state-layer-opacity));
}
.mat-mdc-raised-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-raised-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-raised-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-protected-focus-state-layer-opacity, var(--%NS%mat-sys-focus-state-layer-opacity));
}
.mat-mdc-raised-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-protected-pressed-state-layer-opacity, var(--%NS%mat-sys-pressed-state-layer-opacity));
}
.mat-mdc-raised-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--%NS%mat-button-protected-touch-target-size, 48px);
  display: var(--%NS%mat-button-protected-touch-target-display, block);
  left: 0;
  right: 0;
  transform: translateY(-50%);
}
.mat-mdc-raised-button:not(:disabled) {
  color: var(--%NS%mat-button-protected-label-text-color, var(--%NS%mat-sys-primary));
  background-color: var(--%NS%mat-button-protected-container-color, var(--%NS%mat-sys-surface));
}
.mat-mdc-raised-button, .mat-mdc-raised-button .mdc-button__ripple {
  border-radius: var(--%NS%mat-button-protected-container-shape, var(--%NS%mat-sys-corner-full));
}
@media (hover: hover) {
  .mat-mdc-raised-button:hover {
    box-shadow: var(--%NS%mat-button-protected-hover-container-elevation-shadow, var(--%NS%mat-sys-level2));
  }
}
.mat-mdc-raised-button:focus {
  box-shadow: var(--%NS%mat-button-protected-focus-container-elevation-shadow, var(--%NS%mat-sys-level1));
}
.mat-mdc-raised-button:active, .mat-mdc-raised-button:focus:active {
  box-shadow: var(--%NS%mat-button-protected-pressed-container-elevation-shadow, var(--%NS%mat-sys-level1));
}
.mat-mdc-raised-button[disabled], .mat-mdc-raised-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--%NS%mat-button-protected-disabled-label-text-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 38%, transparent));
  background-color: var(--%NS%mat-button-protected-disabled-container-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 12%, transparent));
}
.mat-mdc-raised-button[disabled].mat-mdc-button-disabled, .mat-mdc-raised-button.mat-mdc-button-disabled.mat-mdc-button-disabled {
  box-shadow: var(--%NS%mat-button-protected-disabled-container-elevation-shadow, var(--%NS%mat-sys-level0));
}
.mat-mdc-raised-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}

.mat-mdc-outlined-button {
  border-style: solid;
  transition: border 280ms cubic-bezier(0.4, 0, 0.2, 1);
  height: var(--%NS%mat-button-outlined-container-height, 40px);
  font-family: var(--%NS%mat-button-outlined-label-text-font, var(--%NS%mat-sys-label-large-font));
  font-size: var(--%NS%mat-button-outlined-label-text-size, var(--%NS%mat-sys-label-large-size));
  letter-spacing: var(--%NS%mat-button-outlined-label-text-tracking, var(--%NS%mat-sys-label-large-tracking));
  text-transform: var(--%NS%mat-button-outlined-label-text-transform);
  font-weight: var(--%NS%mat-button-outlined-label-text-weight, var(--%NS%mat-sys-label-large-weight));
  border-radius: var(--%NS%mat-button-outlined-container-shape, var(--%NS%mat-sys-corner-full));
  border-width: var(--%NS%mat-button-outlined-outline-width, 1px);
  padding: 0 var(--%NS%mat-button-outlined-horizontal-padding, 24px);
}
.mat-mdc-outlined-button > .mat-icon {
  margin-right: var(--%NS%mat-button-outlined-icon-spacing, 8px);
  margin-left: var(--%NS%mat-button-outlined-icon-offset, -8px);
}
[dir=rtl] .mat-mdc-outlined-button > .mat-icon {
  margin-right: var(--%NS%mat-button-outlined-icon-offset, -8px);
  margin-left: var(--%NS%mat-button-outlined-icon-spacing, 8px);
}
.mat-mdc-outlined-button .mdc-button__label + .mat-icon {
  margin-right: var(--%NS%mat-button-outlined-icon-offset, -8px);
  margin-left: var(--%NS%mat-button-outlined-icon-spacing, 8px);
}
[dir=rtl] .mat-mdc-outlined-button .mdc-button__label + .mat-icon {
  margin-right: var(--%NS%mat-button-outlined-icon-spacing, 8px);
  margin-left: var(--%NS%mat-button-outlined-icon-offset, -8px);
}
.mat-mdc-outlined-button .mat-ripple-element {
  background-color: var(--%NS%mat-button-outlined-ripple-color, color-mix(in srgb, var(--%NS%mat-sys-primary) calc(var(--%NS%mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-outlined-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--%NS%mat-button-outlined-state-layer-color, var(--%NS%mat-sys-primary));
}
.mat-mdc-outlined-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--%NS%mat-button-outlined-disabled-state-layer-color, var(--%NS%mat-sys-on-surface-variant));
}
.mat-mdc-outlined-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-outlined-hover-state-layer-opacity, var(--%NS%mat-sys-hover-state-layer-opacity));
}
.mat-mdc-outlined-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-outlined-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-outlined-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-outlined-focus-state-layer-opacity, var(--%NS%mat-sys-focus-state-layer-opacity));
}
.mat-mdc-outlined-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-outlined-pressed-state-layer-opacity, var(--%NS%mat-sys-pressed-state-layer-opacity));
}
.mat-mdc-outlined-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--%NS%mat-button-outlined-touch-target-size, 48px);
  display: var(--%NS%mat-button-outlined-touch-target-display, block);
  left: 0;
  right: 0;
  transform: translateY(-50%);
}
.mat-mdc-outlined-button:not(:disabled) {
  color: var(--%NS%mat-button-outlined-label-text-color, var(--%NS%mat-sys-primary));
  border-color: var(--%NS%mat-button-outlined-outline-color, var(--%NS%mat-sys-outline));
}
.mat-mdc-outlined-button[disabled], .mat-mdc-outlined-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--%NS%mat-button-outlined-disabled-label-text-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 38%, transparent));
  border-color: var(--%NS%mat-button-outlined-disabled-outline-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 12%, transparent));
}
.mat-mdc-outlined-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}

.mat-tonal-button {
  transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);
  height: var(--%NS%mat-button-tonal-container-height, 40px);
  font-family: var(--%NS%mat-button-tonal-label-text-font, var(--%NS%mat-sys-label-large-font));
  font-size: var(--%NS%mat-button-tonal-label-text-size, var(--%NS%mat-sys-label-large-size));
  letter-spacing: var(--%NS%mat-button-tonal-label-text-tracking, var(--%NS%mat-sys-label-large-tracking));
  text-transform: var(--%NS%mat-button-tonal-label-text-transform);
  font-weight: var(--%NS%mat-button-tonal-label-text-weight, var(--%NS%mat-sys-label-large-weight));
  padding: 0 var(--%NS%mat-button-tonal-horizontal-padding, 24px);
}
.mat-tonal-button:not(:disabled) {
  color: var(--%NS%mat-button-tonal-label-text-color, var(--%NS%mat-sys-on-secondary-container));
  background-color: var(--%NS%mat-button-tonal-container-color, var(--%NS%mat-sys-secondary-container));
}
.mat-tonal-button, .mat-tonal-button .mdc-button__ripple {
  border-radius: var(--%NS%mat-button-tonal-container-shape, var(--%NS%mat-sys-corner-full));
}
.mat-tonal-button[disabled], .mat-tonal-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--%NS%mat-button-tonal-disabled-label-text-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 38%, transparent));
  background-color: var(--%NS%mat-button-tonal-disabled-container-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 12%, transparent));
}
.mat-tonal-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}
.mat-tonal-button > .mat-icon {
  margin-right: var(--%NS%mat-button-tonal-icon-spacing, 8px);
  margin-left: var(--%NS%mat-button-tonal-icon-offset, -8px);
}
[dir=rtl] .mat-tonal-button > .mat-icon {
  margin-right: var(--%NS%mat-button-tonal-icon-offset, -8px);
  margin-left: var(--%NS%mat-button-tonal-icon-spacing, 8px);
}
.mat-tonal-button .mdc-button__label + .mat-icon {
  margin-right: var(--%NS%mat-button-tonal-icon-offset, -8px);
  margin-left: var(--%NS%mat-button-tonal-icon-spacing, 8px);
}
[dir=rtl] .mat-tonal-button .mdc-button__label + .mat-icon {
  margin-right: var(--%NS%mat-button-tonal-icon-spacing, 8px);
  margin-left: var(--%NS%mat-button-tonal-icon-offset, -8px);
}
.mat-tonal-button .mat-ripple-element {
  background-color: var(--%NS%mat-button-tonal-ripple-color, color-mix(in srgb, var(--%NS%mat-sys-on-secondary-container) calc(var(--%NS%mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-tonal-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--%NS%mat-button-tonal-state-layer-color, var(--%NS%mat-sys-on-secondary-container));
}
.mat-tonal-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--%NS%mat-button-tonal-disabled-state-layer-color, var(--%NS%mat-sys-on-surface-variant));
}
.mat-tonal-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-tonal-hover-state-layer-opacity, var(--%NS%mat-sys-hover-state-layer-opacity));
}
.mat-tonal-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-tonal-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-tonal-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-tonal-focus-state-layer-opacity, var(--%NS%mat-sys-focus-state-layer-opacity));
}
.mat-tonal-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-tonal-pressed-state-layer-opacity, var(--%NS%mat-sys-pressed-state-layer-opacity));
}
.mat-tonal-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--%NS%mat-button-tonal-touch-target-size, 48px);
  display: var(--%NS%mat-button-tonal-touch-target-display, block);
  left: 0;
  right: 0;
  transform: translateY(-50%);
}

.mat-mdc-button,
.mat-mdc-unelevated-button,
.mat-mdc-raised-button,
.mat-mdc-outlined-button,
.mat-tonal-button {
  -webkit-tap-highlight-color: transparent;
}
.mat-mdc-button .mat-mdc-button-ripple,
.mat-mdc-button .mat-mdc-button-persistent-ripple,
.mat-mdc-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-unelevated-button .mat-mdc-button-ripple,
.mat-mdc-unelevated-button .mat-mdc-button-persistent-ripple,
.mat-mdc-unelevated-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-raised-button .mat-mdc-button-ripple,
.mat-mdc-raised-button .mat-mdc-button-persistent-ripple,
.mat-mdc-raised-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-outlined-button .mat-mdc-button-ripple,
.mat-mdc-outlined-button .mat-mdc-button-persistent-ripple,
.mat-mdc-outlined-button .mat-mdc-button-persistent-ripple::before,
.mat-tonal-button .mat-mdc-button-ripple,
.mat-tonal-button .mat-mdc-button-persistent-ripple,
.mat-tonal-button .mat-mdc-button-persistent-ripple::before {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  pointer-events: none;
  border-radius: inherit;
}
.mat-mdc-button .mat-mdc-button-ripple,
.mat-mdc-unelevated-button .mat-mdc-button-ripple,
.mat-mdc-raised-button .mat-mdc-button-ripple,
.mat-mdc-outlined-button .mat-mdc-button-ripple,
.mat-tonal-button .mat-mdc-button-ripple {
  overflow: hidden;
}
.mat-mdc-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-unelevated-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-raised-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-outlined-button .mat-mdc-button-persistent-ripple::before,
.mat-tonal-button .mat-mdc-button-persistent-ripple::before {
  content: "";
  opacity: 0;
}
.mat-mdc-button .mdc-button__label,
.mat-mdc-button .mat-icon,
.mat-mdc-unelevated-button .mdc-button__label,
.mat-mdc-unelevated-button .mat-icon,
.mat-mdc-raised-button .mdc-button__label,
.mat-mdc-raised-button .mat-icon,
.mat-mdc-outlined-button .mdc-button__label,
.mat-mdc-outlined-button .mat-icon,
.mat-tonal-button .mdc-button__label,
.mat-tonal-button .mat-icon {
  z-index: 1;
  position: relative;
}
.mat-mdc-button .mat-focus-indicator,
.mat-mdc-unelevated-button .mat-focus-indicator,
.mat-mdc-raised-button .mat-focus-indicator,
.mat-mdc-outlined-button .mat-focus-indicator,
.mat-tonal-button .mat-focus-indicator {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  border-radius: inherit;
}
.mat-mdc-button:focus-visible > .mat-focus-indicator::before,
.mat-mdc-unelevated-button:focus-visible > .mat-focus-indicator::before,
.mat-mdc-raised-button:focus-visible > .mat-focus-indicator::before,
.mat-mdc-outlined-button:focus-visible > .mat-focus-indicator::before,
.mat-tonal-button:focus-visible > .mat-focus-indicator::before {
  content: "";
  border-radius: inherit;
}
.mat-mdc-button._mat-animation-noopable,
.mat-mdc-unelevated-button._mat-animation-noopable,
.mat-mdc-raised-button._mat-animation-noopable,
.mat-mdc-outlined-button._mat-animation-noopable,
.mat-tonal-button._mat-animation-noopable {
  transition: none !important;
  animation: none !important;
}
.mat-mdc-button > .mat-icon,
.mat-mdc-unelevated-button > .mat-icon,
.mat-mdc-raised-button > .mat-icon,
.mat-mdc-outlined-button > .mat-icon,
.mat-tonal-button > .mat-icon {
  display: inline-block;
  position: relative;
  vertical-align: top;
  font-size: 1.125rem;
  height: 1.125rem;
  width: 1.125rem;
}

.mat-mdc-outlined-button .mat-mdc-button-ripple,
.mat-mdc-outlined-button .mdc-button__ripple {
  top: -1px;
  left: -1px;
  bottom: -1px;
  right: -1px;
}

.mat-mdc-unelevated-button .mat-focus-indicator::before,
.mat-tonal-button .mat-focus-indicator::before,
.mat-mdc-raised-button .mat-focus-indicator::before {
  margin: calc(calc(var(--%NS%mat-focus-indicator-border-width, 3px) + 2px) * -1);
}

.mat-mdc-outlined-button .mat-focus-indicator::before {
  margin: calc(calc(var(--%NS%mat-focus-indicator-border-width, 3px) + 3px) * -1);
}

.mat-mdc-button-progress-indicator-container {
  position: absolute;
  inset-inline-start: 0;
  inset-block-start: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.mat-mdc-button-progress-indicator-shown mat-icon,
.mat-mdc-button-progress-indicator-shown [matButtonIcon],
.mat-mdc-button-progress-indicator-shown .mdc-button__label {
  visibility: hidden;
}
`,`@media (forced-colors: active) {
  .mat-mdc-button:not(.mdc-button--outlined),
  .mat-mdc-unelevated-button:not(.mdc-button--outlined),
  .mat-mdc-raised-button:not(.mdc-button--outlined),
  .mat-mdc-outlined-button:not(.mdc-button--outlined),
  .mat-mdc-button-base.mat-tonal-button,
  .mat-mdc-icon-button.mat-mdc-icon-button,
  .mat-mdc-outlined-button .mdc-button__ripple {
    outline: solid 1px;
  }
}
`],encapsulation:2})}return s})();function $e(s){return s.hasAttribute(`mat-raised-button`)?`elevated`:s.hasAttribute(`mat-stroked-button`)?`outlined`:s.hasAttribute(`mat-flat-button`)?`filled`:s.hasAttribute(`mat-button`)?`text`:null}var Nn=(()=>{class s{static ɵfac=function(e){return new(e||s)};static ɵmod=nu({type:s});static ɵinj=Ao({imports:[V4,xe$1]})}return s})();function he(s){return Error(`Unable to find icon with the name "${s}"`)}function Be(){return Error(`Could not find HttpClient for use with Angular Material icons. Please add provideHttpClient() to your providers.`)}function ge(s){return Error(`The URL provided to MatIconRegistry was not trusted as a resource URL via Angular's DomSanitizer. Attempted URL was "${s}".`)}function ve(s){return Error(`The literal provided to MatIconRegistry was not trusted as safe HTML by Angular's DomSanitizer. Attempted literal was "${s}".`)}var E=class{url;svgText;options;svgElement=null;constructor(a,t,e){this.url=a,this.svgText=t,this.options=e}};var Se=(()=>{class s{_httpClient;_sanitizer;_errorHandler;_document;_svgIconConfigs=new Map;_iconSetConfigs=new Map;_cachedIconsByUrl=new Map;_inProgressUrlFetches=new Map;_fontCssClassesByAlias=new Map;_resolvers=[];_defaultFontSetClass=[`material-icons`,`mat-ligature-font`];constructor(t,e,n,i){this._httpClient=t,this._sanitizer=e,this._errorHandler=i,this._document=n}addSvgIcon(t,e,n){return this.addSvgIconInNamespace(``,t,e,n)}addSvgIconLiteral(t,e,n){return this.addSvgIconLiteralInNamespace(``,t,e,n)}addSvgIconInNamespace(t,e,n,i){return this._addSvgIconConfig(t,e,new E(n,null,i))}addSvgIconResolver(t){return this._resolvers.push(t),this}addSvgIconLiteralInNamespace(t,e,n,i){let o=this._sanitizer.sanitize(ea.HTML,n);if(!o)throw ve(n);let r=Wo(o);return this._addSvgIconConfig(t,e,new E(``,r,i))}addSvgIconSet(t,e){return this.addSvgIconSetInNamespace(``,t,e)}addSvgIconSetLiteral(t,e){return this.addSvgIconSetLiteralInNamespace(``,t,e)}addSvgIconSetInNamespace(t,e,n){return this._addSvgIconSetConfig(t,new E(e,null,n))}addSvgIconSetLiteralInNamespace(t,e,n){let i=this._sanitizer.sanitize(ea.HTML,e);if(!i)throw ve(e);let o=Wo(i);return this._addSvgIconSetConfig(t,new E(``,o,n))}registerFontClassAlias(t,e=t){return this._fontCssClassesByAlias.set(t,e),this}classNameForFontAlias(t){return this._fontCssClassesByAlias.get(t)||t}setDefaultFontSetClass(...t){return this._defaultFontSetClass=t,this}getDefaultFontSetClass(){return this._defaultFontSetClass}getSvgIconFromUrl(t){let e=this._sanitizer.sanitize(ea.RESOURCE_URL,t);if(!e)throw ge(t);let n=this._cachedIconsByUrl.get(e);return n?Gg(yt(n)):this._loadSvgIconFromConfig(new E(t,null)).pipe(Xu(i=>this._cachedIconsByUrl.set(e,i)),he$1(i=>yt(i)))}getNamedSvgIcon(t,e=``){let n=ye(e,t),i=this._svgIconConfigs.get(n);if(i)return this._getSvgFromConfig(i);if(i=this._getIconConfigFromResolvers(e,t),i)return this._svgIconConfigs.set(n,i),this._getSvgFromConfig(i);let o=this._iconSetConfigs.get(e);return o?this._getSvgFromIconSetConfigs(t,o):Wg(he(n))}ngOnDestroy(){this._resolvers=[],this._svgIconConfigs.clear(),this._iconSetConfigs.clear(),this._cachedIconsByUrl.clear()}_getSvgFromConfig(t){return t.svgText?Gg(yt(this._svgElementFromConfig(t))):this._loadSvgIconFromConfig(t).pipe(he$1(e=>yt(e)))}_getSvgFromIconSetConfigs(t,e){let n=this._extractIconWithNameFromAnySet(t,e);if(n)return Gg(n);return tm(e.filter(o=>!o.svgText).map(o=>this._loadSvgIconSetFromConfig(o).pipe(ds(r=>{let u=`Loading icon set URL: ${this._sanitizer.sanitize(ea.RESOURCE_URL,o.url)} failed: ${r.message}`;return this._errorHandler.handleError(new Error(u)),Gg(null)})))).pipe(he$1(()=>{let o=this._extractIconWithNameFromAnySet(t,e);if(!o)throw he(t);return o}))}_extractIconWithNameFromAnySet(t,e){for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.svgText&&i.svgText.toString().indexOf(t)>-1){let o=this._svgElementFromConfig(i),r=this._extractSvgIconFromSet(o,t,i.options);if(r)return r}}return null}_loadSvgIconFromConfig(t){return this._fetchIcon(t).pipe(Xu(e=>t.svgText=e),he$1(()=>this._svgElementFromConfig(t)))}_loadSvgIconSetFromConfig(t){return t.svgText?Gg(null):this._fetchIcon(t).pipe(Xu(e=>t.svgText=e))}_extractSvgIconFromSet(t,e,n){let i=t.querySelector(`[id="${e}"]`);if(!i)return null;let o=i.cloneNode(!0);if(o.removeAttribute(`id`),o.nodeName.toLowerCase()===`svg`)return this._setSvgAttributes(o,n);if(o.nodeName.toLowerCase()===`symbol`)return this._setSvgAttributes(this._toSvgElement(o),n);let r=this._svgElementFromString(Wo(`<svg></svg>`));return r.appendChild(o),this._setSvgAttributes(r,n)}_svgElementFromString(t){let e=this._document.createElement(`DIV`);e.innerHTML=t;let n=e.querySelector(`svg`);if(!n)throw Error(`<svg> tag not found`);return n}_toSvgElement(t){let e=this._svgElementFromString(Wo(`<svg></svg>`)),n=t.attributes;for(let i=0;i<n.length;i++){let{name:o,value:r}=n[i];o!==`id`&&e.setAttribute(o,r)}for(let i=0;i<t.childNodes.length;i++)t.childNodes[i].nodeType===this._document.ELEMENT_NODE&&e.appendChild(t.childNodes[i].cloneNode(!0));return e}_setSvgAttributes(t,e){return t.setAttribute(`fit`,``),t.setAttribute(`height`,`100%`),t.setAttribute(`width`,`100%`),t.setAttribute(`preserveAspectRatio`,`xMidYMid meet`),t.setAttribute(`focusable`,`false`),e&&e.viewBox&&t.setAttribute(`viewBox`,e.viewBox),t}_fetchIcon(t){let{url:e,options:n}=t,i=n?.withCredentials??!1;if(!this._httpClient)throw Be();if(e==null)throw Error(`Cannot fetch icon from URL "${e}".`);let o=this._sanitizer.sanitize(ea.RESOURCE_URL,e);if(!o)throw ge(e);let r=this._inProgressUrlFetches.get(o);if(r)return r;let l=this._httpClient.get(o,{responseType:`text`,withCredentials:i}).pipe(he$1(u=>Wo(u)),Ju(()=>this._inProgressUrlFetches.delete(o)),gs());return this._inProgressUrlFetches.set(o,l),l}_addSvgIconConfig(t,e,n){return this._svgIconConfigs.set(ye(t,e),n),this}_addSvgIconSetConfig(t,e){let n=this._iconSetConfigs.get(t);return n?n.push(e):this._iconSetConfigs.set(t,[e]),this}_svgElementFromConfig(t){if(!t.svgElement){let e=this._svgElementFromString(t.svgText);this._setSvgAttributes(e,t.options),t.svgElement=e}return t.svgElement}_getIconConfigFromResolvers(t,e){for(let n=0;n<this._resolvers.length;n++){let i=this._resolvers[n](e,t);if(i)return ze(i)?new E(i.url,null,i.options):new E(i,null)}}static ɵfac=function(e){return new(e||s)(K(qn,8),K(Oi),K(je$1,8),K(it))};static ɵprov=P({token:s,factory:s.ɵfac,providedIn:`root`})}return s})();function yt(s){return s.cloneNode(!0)}function ye(s,a){return s+`:`+a}function ze(s){return!!(s.url&&s.options)}var He=[`*`];var We=new S(`MAT_ICON_DEFAULT_OPTIONS`);var je=new S(`mat-icon-location`,{providedIn:`root`,factory:()=>{let s=D(je$1),a=s?s.location:null;return{getPathname:()=>a?a.pathname+a.search:``}}});var we=[`clip-path`,`color-profile`,`src`,`cursor`,`fill`,`filter`,`marker`,`marker-start`,`marker-mid`,`marker-end`,`mask`,`stroke`];var Ue=we.map(s=>`[${s}]`).join(`, `);var Ve=/^url\(['"]?#(.*?)['"]?\)$/;var Wn=(()=>{class s{_elementRef=D(Hn);_iconRegistry=D(Se);_location=D(je);_errorHandler=D(it);_defaultColor;get color(){return this._color||this._defaultColor}set color(t){this._color=t}_color;inline=!1;get svgIcon(){return this._svgIcon}set svgIcon(t){t!==this._svgIcon&&(t?this._updateSvgIcon(t):this._svgIcon&&this._clearSvgElement(),this._svgIcon=t)}_svgIcon;get fontSet(){return this._fontSet}set fontSet(t){let e=this._cleanupFontValue(t);e!==this._fontSet&&(this._fontSet=e,this._updateFontIconClasses())}_fontSet;get fontIcon(){return this._fontIcon}set fontIcon(t){let e=this._cleanupFontValue(t);e!==this._fontIcon&&(this._fontIcon=e,this._updateFontIconClasses())}_fontIcon;_previousFontSetClass=[];_previousFontIconClass;_svgName=null;_svgNamespace=null;_previousPath;_elementsWithExternalReferences;_currentIconFetch=Q.EMPTY;constructor(){let t=D(new ag(`aria-hidden`),{optional:!0}),e=D(We,{optional:!0});e&&(e.color&&(this.color=this._defaultColor=e.color),e.fontSet&&(this.fontSet=e.fontSet)),t||this._elementRef.nativeElement.setAttribute(`aria-hidden`,`true`)}_splitIconName(t){if(!t)return[``,``];let e=t.split(`:`);switch(e.length){case 1:return[``,e[0]];case 2:return e;default:throw Error(`Invalid icon name: "${t}"`)}}ngOnInit(){this._updateFontIconClasses()}ngAfterViewChecked(){let t=this._elementsWithExternalReferences;if(t&&t.size){let e=this._location.getPathname();e!==this._previousPath&&(this._previousPath=e,this._prependPathToReferences(e))}}ngOnDestroy(){this._currentIconFetch.unsubscribe(),this._elementsWithExternalReferences&&this._elementsWithExternalReferences.clear()}_usingFontIcon(){return!this.svgIcon}_setSvgElement(t){this._clearSvgElement();let e=this._location.getPathname();this._previousPath=e,this._cacheChildrenWithExternalReferences(t),this._prependPathToReferences(e),this._elementRef.nativeElement.appendChild(t)}_clearSvgElement(){let t=this._elementRef.nativeElement,e=t.childNodes.length;for(this._elementsWithExternalReferences&&this._elementsWithExternalReferences.clear();e--;){let n=t.childNodes[e];(n.nodeType!==1||n.nodeName.toLowerCase()===`svg`)&&n.remove()}}_updateFontIconClasses(){if(!this._usingFontIcon())return;let t=this._elementRef.nativeElement,e=(this.fontSet?this._iconRegistry.classNameForFontAlias(this.fontSet).split(/ +/):this._iconRegistry.getDefaultFontSetClass()).filter(n=>n.length>0);this._previousFontSetClass.forEach(n=>t.classList.remove(n)),e.forEach(n=>t.classList.add(n)),this._previousFontSetClass=e,this.fontIcon!==this._previousFontIconClass&&!e.includes(`mat-ligature-font`)&&(this._previousFontIconClass&&t.classList.remove(this._previousFontIconClass),this.fontIcon&&t.classList.add(this.fontIcon),this._previousFontIconClass=this.fontIcon)}_cleanupFontValue(t){return typeof t==`string`?t.trim().split(` `)[0]:t}_prependPathToReferences(t){let e=this._elementsWithExternalReferences;e&&e.forEach((n,i)=>{n.forEach(o=>{i.setAttribute(o.name,`url('${t}#${o.value}')`)})})}_cacheChildrenWithExternalReferences(t){let e=t.querySelectorAll(Ue),n=this._elementsWithExternalReferences=this._elementsWithExternalReferences||new Map;for(let i=0;i<e.length;i++)we.forEach(o=>{let r=e[i],l=r.getAttribute(o),u=l?l.match(Ve):null;if(u){let g=n.get(r);g||(g=[],n.set(r,g)),g.push({name:o,value:u[1]})}})}_updateSvgIcon(t){if(this._svgNamespace=null,this._svgName=null,this._currentIconFetch.unsubscribe(),t){let[e,n]=this._splitIconName(t);e&&(this._svgNamespace=e),n&&(this._svgName=n),this._currentIconFetch=this._iconRegistry.getNamedSvgIcon(n,e).pipe(dn(1)).subscribe(i=>this._setSvgElement(i),i=>{let o=`Error retrieving icon ${e}:${n}! ${i.message}`;this._errorHandler.handleError(new Error(o))})}}static ɵfac=function(e){return new(e||s)};static ɵcmp=nI({type:s,selectors:[[`mat-icon`]],hostAttrs:[`role`,`img`,1,`mat-icon`,`notranslate`],hostVars:10,hostBindings:function(e,n){e&2&&(Nh(`data-mat-icon-type`,n._usingFontIcon()?`font`:`svg`)(`data-mat-icon-name`,n._svgName||n.fontIcon)(`data-mat-icon-namespace`,n._svgNamespace||n.fontSet)(`fontIcon`,n._usingFontIcon()?n.fontIcon:null),AC(n.color?`mat-`+n.color:``),qh(`mat-icon-inline`,n.inline)(`mat-icon-no-color`,n.color!==`primary`&&n.color!==`accent`&&n.color!==`warn`))},inputs:{color:`color`,inline:[2,`inline`,`inline`,eP],svgIcon:`svgIcon`,fontSet:`fontSet`,fontIcon:`fontIcon`},exportAs:[`matIcon`],ngContentSelectors:He,decls:1,vars:0,template:function(e,n){e&1&&(hC(),gC(0))},styles:[`mat-icon, mat-icon.mat-primary, mat-icon.mat-accent, mat-icon.mat-warn {
  color: var(--%NS%mat-icon-color, inherit);
}

.mat-icon {
  -webkit-user-select: none;
  user-select: none;
  background-repeat: no-repeat;
  display: inline-block;
  fill: currentColor;
  height: 24px;
  width: 24px;
  overflow: hidden;
}
.mat-icon.mat-icon-inline {
  font-size: inherit;
  height: inherit;
  line-height: inherit;
  width: inherit;
}
.mat-icon.mat-ligature-font[fontIcon]::before {
  content: attr(fontIcon);
}

[dir=rtl] .mat-icon-rtl-mirror {
  transform: scale(-1, 1);
}

.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-prefix .mat-icon,
.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-suffix .mat-icon {
  display: block;
}
.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-prefix .mat-icon-button .mat-icon,
.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-suffix .mat-icon-button .mat-icon {
  margin: auto;
}
`],encapsulation:2})}return s})();var jn=(()=>{class s{static ɵfac=function(e){return new(e||s)};static ɵmod=nu({type:s});static ɵinj=Ao({imports:[xe$1]})}return s})();Object.freeze([`drawLayer`,`drawRoute`,`measureLayer`,`cameraViewToolsLayer`,`analysisToolsLayer`]);var Y=class s{constructor(a,t,e){this.$viewerService=a;this.$cursorCoordsService=t;this.$checkMobileDeviceService=e;this._isMobile=this.$checkMobileDeviceService.checkMobile()}$viewerService;$cursorCoordsService;$checkMobileDeviceService;_viewer={};get viewer(){return this._viewer}_toolsServiceHasStarted=Nn$1(!1);get toolsServiceHasStarted(){return this._toolsServiceHasStarted}_isMobile=!1;get isMobile(){return this._isMobile}drawingToolsLayerName=`drawLayer`;drawRouteLayerName=`drawRoute`;measuringToolsLayerName=`measureLayer`;cameraViewToolsLayerName=`cameraViewToolsLayer`;analysisToolsLayerName=`analysisToolsLayer`;async startToolsService(){try{this._viewer=this.$viewerService.viewer,await this._viewer?.dataSources.add(new P1(this.drawingToolsLayerName)),await this._viewer?.dataSources.add(new TR(this.drawRouteLayerName)),await this._viewer?.dataSources.add(new P1(this.measuringToolsLayerName)),await this._viewer?.dataSources.add(new P1(this.cameraViewToolsLayerName)),await this._viewer?.dataSources.add(new P1(this.analysisToolsLayerName)),this._toolsServiceHasStarted.set(!0)}catch(a){throw this._toolsServiceHasStarted()===!0&&this._toolsServiceHasStarted.set(!1),console.info(`Ошибка старта ToolsService`),a}}_activeTool=Nn$1(void 0);get activeTool(){return this._activeTool}setActiveTool(a){this._activeTool.set(a)}_lastActiveTool=ow({source:this._activeTool,computation(a,t){return a!==void 0?a:t?.value}});get lastActiveTool(){return this._lastActiveTool}_drawingsBlocker=Nn$1(!1);get drawingsBlocker(){return this._drawingsBlocker}setDrawingsBlocker(a){typeof a==`boolean`&&this._drawingsBlocker.set(a)}_commonHandler=Nn$1(void 0);get commonHandler(){return this._commonHandler}createNewCommonHandler(a){this._commonHandler.set(new qg(this._viewer.scene.canvas));let t=this._commonHandler();return t&&(t._initializer=a),this._activeTool.set(a),!0}setCommonHandler(a,t,e){return this._commonHandler()?.setInputAction(a,t,e),!0}removeActionFromCommonHandler(a,t){return this._commonHandler()?.removeInputAction(a,t),!0}clearCommonHandler(){try{if(this._activeTool.set(void 0),this._commonHandler()!==void 0)if(this._commonHandler()instanceof qg){if(this._commonHandler()?.destroy(),this._commonHandler()?.isDestroyed())return this._commonHandler.set(void 0),!0;throw new Error(`Error whith cleaning drawing _commonHandler`)}else return this._commonHandler.set(void 0),!0;else return!0}finally{this.$viewerService.entityPickingBlock()&&this.$viewerService.offEntityPickingBlock(),this._drawingsBlocker()===!0&&this._drawingsBlocker.set(!1)}}eventSource=new Y$1;cancelEvent$=this.eventSource.asObservable();triggerForCancelEvent(a){this.eventSource.next(a)}alertAboutToolError(a){this.triggerForCancelEvent(a),alert(`Отмена сценария по причине расчетной ошибки`)}_nowTerrainName=nw(()=>{try{let a={id:-1,name:``};return this.$viewerService?.viewer?.terrainProvider?.credit?.html||(a?.id!==-1?a?.name:void 0)}catch(a){IC(a);return}});get nowTerrainName(){return this._nowTerrainName}_isTerrain=nw(()=>{try{return!!this._nowTerrainName()}catch(a){return IC(a),!1}});get isTerrain(){return this._isTerrain}setPointEntity(a,t={}){try{if(a===void 0)throw new Error(`Position arg is undefined in setPointEntity()`);let e=t?.id?t?.id:`${Math.ceil(Math.random()*1e6)}`;if(this._viewer.entities?.getById(e))throw new Error(`Entity already exist on draw layer in setPointEntity()`);let n=new Hi({id:e,name:t?.name?t?.name:t?.id?`${e}`:`point-${e}`,position:a,billboard:t?.billboard||void 0,label:t?.label?r({show:!0,text:t?.name?t?.name:t?.id?`${e}`:`point-${e}`,showBackground:!0,backgroundColor:new U$1(.165,.165,.165,.4),font:`14px sans-serif`,translucencyByDistance:new kt(3e6,1,5e6,0),style:oo.FILL,horizontalOrigin:Ei.CENTER,verticalOrigin:Nn$2.TOP,pixelOffset:new z(0,-60),disableDepthTestDistance:void 0,heightReference:We$1.CLAMP_TO_GROUND},t?.label):void 0,point:r({show:!1,pixelSize:4,color:U$1.WHITE,outline:!1,disableDepthTestDistance:void 0,heightReference:t?.clampToGround?We$1.CLAMP_TO_GROUND:We$1.NONE},t?.point),properties:t?.properties||void 0,show:t?.show!==void 0?t.show:!0});if(t?.clampToGround===void 0){let i=this.$viewerService?.clampToGroundSignal?.();n?.label&&t?.clampToGround===void 0&&(n.label.heightReference=i?new si(We$1.CLAMP_TO_GROUND):new si(We$1.NONE)),n?.billboard&&t?.clampToGround===void 0&&(n.billboard.heightReference=i?new si(We$1.CLAMP_TO_GROUND):new si(We$1.NONE)),i===!0&&this.setClampingToGroudForEntity(n)}return t?.clampToGround===!0&&this.setClampingToGroudForEntity(n),t.toolName&&(n.toolName=t.toolName),n}catch(e){this.alertAboutToolError(this._lastActiveTool()),IC(e);return}}setLineEntity(a,t,e,n={}){try{if(!a?.length)throw new Error(`Positions arg is undefined in setLineEntity()`);let i=n?.id?n?.id:`${Math.ceil(Math.random()*1e6)}`;if(this._viewer.entities?.getById(i))throw new Error(`Entity already exist on draw layer in setLineEntity()`);n?.clampToGround===void 0&&(n.clampToGround=this.$viewerService?.clampToGroundSignal?.());let o=new Hi({id:i,name:n?.name?n?.name:n?.id?`${i}`:`line-${i}`,position:t,label:r({text:e||(n?.name?n.name:n?.id?`${i}`:`line-${i}`),show:!0,showBackground:!0,font:n?.font?n?.font:`14px monospace`,horizontalOrigin:Ei.LEFT,verticalOrigin:Nn$2.BOTTOM,pixelOffset:new z(-20,-20),translucencyByDistance:new kt(3e6,1,5e6,0),style:oo.FILL,disableDepthTestDistance:void 0,heightReference:n?.clampToGround?We$1.CLAMP_TO_GROUND:We$1.NONE},n?.label),polyline:r({positions:a,width:n?.width?n?.width:3,material:n?.isMeasures===!0?new ww({color:n?.color?n?.color:U$1.RED.withAlpha(1),gapColor:U$1.TRANSPARENT,dashLength:16,dashPattern:3855}):n?.material?n.material:n?.color?n?.color:n?.randomColor?U$1.fromHsl(Math.random(),1,.5,1):U$1.CHOCOLATE.withAlpha(1),clampToGround:n?.clampToGround},n?.polyline),properties:n?.properties||void 0});return n?.clampToGround===!0&&this.setClampingToGroudForEntity(o),n.toolName&&(o.toolName=n.toolName),o}catch(i){this.alertAboutToolError(this._lastActiveTool()),IC(i);return}}setPolygonEntity(a,t,e,n,i={}){try{if(!a?.length)throw new Error(`Positions arg is undefined in setLineEntity()`);let o=i?.id?i?.id:`${Math.ceil(Math.random()*1e6)}`;if(this._viewer.entities?.getById(o))throw new Error(`Entity already exist on draw layer in setPolygonEntity()`);i?.clampToGround===void 0&&(i.clampToGround=this.$viewerService?.clampToGroundSignal?.());let r$1=new Hi({id:o,name:i?.name?i?.name:i?.id?`${o}`:`polygon-${o}`,position:t,point:r({show:!1,pixelSize:4,color:U$1.WHITE,outline:!1,disableDepthTestDistance:void 0,heightReference:i?.clampToGround?We$1.CLAMP_TO_GROUND:We$1.NONE},i?.point),label:r({text:e||(i?.name?i.name:i?.id?`${o}`:`polygon-${o}`),show:!0,showBackground:!0,font:i?.font?i?.font:`14px sans-serif`,horizontalOrigin:Ei.LEFT,verticalOrigin:Nn$2.BOTTOM,pixelOffset:new z(-20,-40),translucencyByDistance:new kt(3e6,1,5e6,0),style:oo.FILL,disableDepthTestDistance:void 0,heightReference:i?.clampToGround?We$1.CLAMP_TO_GROUND:We$1.NONE},i?.label),polyline:r({positions:a,width:i?.width?i?.width:3,material:i?.isMeasures===!0?new ww({color:i?.color?i?.color:U$1.RED.withAlpha(1),gapColor:U$1.TRANSPARENT,dashLength:16,dashPattern:3855}):i?.color?i?.color:i?.randomColor?U$1.fromHsl(Math.random(),1,.5,1):U$1.CHOCOLATE.withAlpha(1),clampToGround:i?.clampToGround},i?.polyline),polygon:i?.withoutPolygon?void 0:{material:i?.material?i?.material:U$1.WHITE.withAlpha(.3),perPositionHeight:!i.clampToGround,hierarchy:new fh$1(()=>n,!1)}});return i?.clampToGround===!0&&this.setClampingToGroudForEntity(r$1),i.toolName&&(r$1.toolName=i.toolName),r$1}catch(o){this.alertAboutToolError(this._lastActiveTool()),IC(o);return}}setEllipseEntity(a,t,e,n,i,o,r$2={}){try{if(!a?.length)throw new Error(`Positions arg is undefined in setEllipseEntity()`);let l=r$2?.id?r$2?.id:`${Math.ceil(Math.random()*1e6)}`;if(this._viewer.entities?.getById(l))throw new Error(`Entity already exist on draw layer in setEllipseEntity()`);r$2?.clampToGround===void 0&&(r$2.clampToGround=this.$viewerService?.clampToGroundSignal?.());let u=new Hi({id:l,name:r$2?.name?r$2?.name:r$2?.id?`${l}`:`ellipse-${l}`,position:t,point:r({show:!1,pixelSize:4,color:U$1.WHITE,outline:!1,disableDepthTestDistance:void 0,heightReference:r$2?.clampToGround?We$1.CLAMP_TO_GROUND:We$1.NONE},r$2?.point),label:r({text:e||(r$2?.name?r$2.name:r$2?.id?`${l}`:`ellipse-${l}`),show:!0,showBackground:!0,font:r$2?.font?r$2?.font:`14px sans-serif`,horizontalOrigin:Ei.LEFT,verticalOrigin:Nn$2.BOTTOM,pixelOffset:new z(-20,-40),translucencyByDistance:new kt(3e6,1,5e6,0),style:oo.FILL,disableDepthTestDistance:void 0,heightReference:r$2?.clampToGround?We$1.CLAMP_TO_GROUND:We$1.NONE},r$2?.label),polyline:r({positions:a,width:r$2?.width?r$2?.width:3,material:r$2?.isMeasures===!0?new ww({color:r$2?.color?r$2?.color:U$1.RED.withAlpha(1),gapColor:U$1.TRANSPARENT,dashLength:16,dashPattern:3855}):r$2?.color?r$2?.color:r$2?.randomColor?U$1.fromHsl(Math.random(),1,.5,1):U$1.CHOCOLATE.withAlpha(1),clampToGround:r$2?.clampToGround},r$2?.polyline),polygon:r$2?.withoutPolygon?void 0:r$2?.polygon?r$2.polygon:void 0,ellipse:r({semiMinorAxis:i||0,semiMajorAxis:n||0,rotation:0,material:U$1.WHITE.withAlpha(.3),height:o||0,heightReference:r$2?.clampToGround?We$1.CLAMP_TO_GROUND:We$1.NONE,show:!0},r$2?.ellipse)});return r$2?.clampToGround===!0&&this.setClampingToGroudForEntity(u),r$2.toolName&&(u.toolName=r$2.toolName),u}catch(l){this.alertAboutToolError(this._lastActiveTool()),IC(l);return}}setEllipsoidEntity(a,t,e,n,i,o,r$3={}){try{if(!a?.length)throw new Error(`Positions arg is undefined in setEllipsoidEntity()`);let l=r$3?.id?r$3?.id:`${Math.ceil(Math.random()*1e6)}`;if(this._viewer.entities?.getById(l))throw new Error(`Entity already exist on draw layer in setEllipsoidEntity()`);let u=r$3?.color?r$3?.color:r$3?.randomColor?U$1.fromHsl(Math.random(),1,.5,1):U$1.BLUE.withAlpha(.3),g=U$1.BLACK.withAlpha(1),y;r$3?.arrow?y=new Ew(r$3?.auxiliaryColor?r$3?.auxiliaryColor:U$1.RED.withAlpha(1)):y=new ww({color:r$3?.auxiliaryColor?r$3?.auxiliaryColor:U$1.RED.withAlpha(1),gapColor:U$1.TRANSPARENT,dashLength:16,dashPattern:3855});let q=r$3?.auxiliaryColor?r$3?.auxiliaryColor:U$1.RED.withAlpha(1),At=new Hi({id:l,name:r$3?.name?r$3?.name:r$3?.id?`${l}`:`ellipsoid-${l}`,position:t,point:r$3.withPoint?r({pixelSize:4,color:U$1.WHITE.withAlpha(1),outline:!0,outlineColor:r$3.auxiliaryColor?r$3?.auxiliaryColor:U$1.RED.withAlpha(1),outlineWidth:2,disableDepthTestDistance:Number.POSITIVE_INFINITY,heightReference:We$1.NONE},r$3?.point):void 0,label:r({text:e||(r$3?.name?r$3.name:r$3?.id?`${l}`:`ellipsoid-${l}`),show:!0,showBackground:!0,font:r$3?.font?r$3?.font:`14px monospace`,horizontalOrigin:Ei.LEFT,verticalOrigin:Nn$2.BOTTOM,pixelOffset:new z(20,0),translucencyByDistance:new kt(3e6,1,5e6,0),style:oo.FILL,disableDepthTestDistance:Number.POSITIVE_INFINITY,heightReference:We$1.NONE},r$3?.label),polyline:r$3.withPoint?r({positions:a,width:r$3?.width?r$3?.width:3,material:y,clampToGround:!1,show:!0},r$3?.polyline):void 0,ellipse:r$3.withPoint?r({semiMinorAxis:i,semiMajorAxis:i,rotation:0,material:U$1.WHITE.withAlpha(.3),outline:!0,outlineColor:q,outlineWidth:r$3?.width?r$3?.width:3,height:o||0,heightReference:We$1.NONE,show:!0},r$3?.ellipse):void 0,ellipsoid:r({radii:n,minimumCone:r$3?.minimumCone?r$3?.minimumCone:P$1.toRadians(0),maximumCone:r$3?.maximumCone?r$3?.maximumCone:P$1.toRadians(90),material:u,outline:!0,outlineColor:g,outlineWidth:r$3?.width?r$3?.width:1,heightReference:We$1.NONE,show:!0},r$3?.ellipsoid)});return r$3.toolName&&(At.toolName=r$3.toolName),At}catch(l){this.alertAboutToolError(this._lastActiveTool()),IC(l);return}}changeEntityName(a,t,e,n){try{let i=this.findEntityPathInStore(t,e),o=i.indexGroup,r=i.indexEntity;if(o===void 0||r===void 0)throw new Error(`Entity's path search error in changeEntityName fn`);if(e()[o]?.entitiesList[r]?.name)e.update(g=>{let y=g[o]?.entitiesList[r];return y&&(y.name=a.trim()),[...g]});else throw new Error(`Invalid path to entity's name in changeEntityName fn`);let u=e()[o]?.entitiesList[r];return n!==void 0&&typeof n==`string`&&u?.label&&(u.label.text=new si(n.trim())),!0}catch(i){return IC(i),!1}}changeEntityColor(a,t,e){try{let n=this.findEntityPathInStore(t,e),i=n.indexGroup,o=n.indexEntity;if(i===void 0||o===void 0)throw new Error(`Entity's path search error in changeEntityName fn`);let r=e()[i]?.entitiesList[o],l=qe(a);return!l||!r?.polyline?.material?!1:(r.polyline.material=new Ht(l),!0)}catch(n){return IC(n),!1}}findEntityPathInStore(a,t){try{if(a.split(`-`).length<2)throw new Error(`Invalid id (none groupId) in findEntityPathInStore fn`);let e=a.split(`-`)[0];if(!t().length)throw new Error(`Store is empty in findEntityPathInStore fn`);let n=t().findIndex(r=>r?.groupId===e);if(n===-1)return{indexGroup:void 0,indexEntity:void 0};let i=t()[n];if(!i?.entitiesList.length)return console.info(`Entity collection in group is empty in findEntityPathInStore fn. Array may be already cleared.`),{indexGroup:void 0,indexEntity:void 0};let o=i.entitiesList.findIndex(r=>r?.id===a);return n===-1?{indexGroup:void 0,indexEntity:void 0}:{indexGroup:n,indexEntity:o}}catch(e){return IC(e),{indexGroup:void 0,indexEntity:void 0}}}switchClampingToGroudForOneStoreEntities(a,t){try{if(console.info(`Switching clamping to groud for entities in store: "${a.name}"`),!a().length)return!1;let e=0,n=0;for(let i of a())if(i?.entitiesList.length){n=n+i.entitiesList.length;for(let o of i.entitiesList)o instanceof Hi&&this.switchClampingToGroudForEntity(o,t)&&e++}return e===n}catch(e){return IC(e),!1}}switchClampingToGroudForTemporalEntities(a,t,e){try{if(!a().length)return!1;let n=0,i=0;for(let o of a())if(o instanceof Hi)if(e?.length){let r=!1;for(let l of e)o?.id?.includes(l)===!0&&(r=!0,i++);r||this.switchClampingToGroudForEntity(o,t)&&n++}else this.switchClampingToGroudForEntity(o,t)&&n++;return n===a().length-i}catch(n){return IC(n),!1}}setClampingToGroudForEntity(a){try{let t=!0;return(this.$viewerService.viewer.scene.mode===te.COLUMBUS_VIEW||this.$viewerService.viewer.scene.mode===te.SCENE2D)&&(t=!1),this.switchClampingToGroudForEntity(a,t)}catch(t){return IC(t),!1}}switchClampingToGroudForEntity(a,t){try{return a?.point&&(t?a.point.heightReference=new si(We$1.CLAMP_TO_GROUND):a.point.heightReference=new si(We$1.NONE),t?a.point.disableDepthTestDistance=void 0:a.point.disableDepthTestDistance=new si(Number.POSITIVE_INFINITY)),a?.label&&(t?a.label.heightReference=new si(We$1.CLAMP_TO_GROUND):a.label.heightReference=new si(We$1.NONE),t?a.label.disableDepthTestDistance=void 0:a.label.disableDepthTestDistance=new si(Number.POSITIVE_INFINITY)),a?.billboard&&(t?a.billboard.heightReference=new si(We$1.CLAMP_TO_GROUND):a.billboard.heightReference=new si(We$1.NONE),t?a.billboard.disableDepthTestDistance=void 0:a.billboard.disableDepthTestDistance=new si(Number.POSITIVE_INFINITY)),a?.polyline&&(a.polyline.clampToGround=new si(t)),a?.polygon?.perPositionHeight&&(a.polygon.perPositionHeight=new si(!t)),a?.ellipse&&(t?a.ellipse.heightReference=new si(We$1.CLAMP_TO_GROUND):a.ellipse.heightReference=new si(We$1.NONE)),!0}catch(e){return IC(e),!1}}setEntityConstantsTimer=18e4;setConstantsForStoreEntities(a,t){try{let e=t;if(!e||typeof e!=`string`)throw new Error(`Invalid entity's ID in setConstantsForStoreEntities fn`);if(!a().length)return!1;let n=this.findEntityPathInStore(e,a);if(n.indexGroup===void 0||n.indexEntity===void 0)return!1;let i=a()?.[n.indexGroup]?.entitiesList?.[n.indexEntity];if(!i||!(i instanceof Hi))throw new Error(`Invalid entity in setConstantsForStoreEntities fn`);if(console.info(`Auto rerender for:`,t),N(i.position)){let o=Mt(i.position.getValue());o&&(i.position=new Sl(o))}if(i.label?.text&&N(i.label.text)){let o=Ze(i.label.text.getValue());o!==void 0&&(i.label.text=new si(o))}if(i.billboard?.color&&N(i.billboard.color)){let o=St(i.billboard.color.getValue());o&&(i.billboard.color=new si(new U$1(o.red,o.green,o.blue,o.alpha??1)))}if(i.polyline){if(i.polyline.positions&&N(i.polyline.positions)){let o=Ye(i.polyline.positions.getValue());o.length&&(i.polyline.positions=new si(o))}if(i.polyline.material&&N(i.polyline.material)){let o=Dt(i.polyline.material.getValue());o&&(i.polyline.material=new Ht(o))}}if(i.polygon?.material&&N(i.polygon.material)){let o=Dt(i.polygon.material.getValue());o&&(i.polygon.material=new Ht(o))}if(i.ellipse){if(i.ellipse.semiMinorAxis&&N(i.ellipse.semiMinorAxis)){let o=A(i.ellipse.semiMinorAxis.getValue());o!==void 0&&(i.ellipse.semiMinorAxis=new si(o))}if(i.ellipse.semiMajorAxis&&N(i.ellipse.semiMajorAxis)){let o=A(i.ellipse.semiMajorAxis.getValue());o!==void 0&&(i.ellipse.semiMajorAxis=new si(o))}}if(i.ellipsoid){if(i.ellipsoid.radii&&N(i.ellipsoid.radii)){let o=Mt(i.ellipsoid.radii.getValue());o&&(i.ellipsoid.radii=new si(o))}if(i.ellipsoid.material&&N(i.ellipsoid.material)){let o=Dt(i.ellipsoid.material.getValue());o&&(i.ellipsoid.material=new Ht(o))}if(i.ellipsoid.maximumCone&&N(i.ellipsoid.maximumCone)){let o=A(i.ellipsoid.maximumCone.getValue());o!==void 0&&(i.ellipsoid.maximumCone=new si(o))}if(i.ellipsoid.minimumCone&&N(i.ellipsoid.minimumCone)){let o=A(i.ellipsoid.minimumCone.getValue());o!==void 0&&(i.ellipsoid.minimumCone=new si(o))}}return!0}catch(e){return IC(e),!1}}async getMouseEntity(a=!0){return await this.$cursorCoordsService.getMouseEntity(a)}async getDetailedPosition(a){try{if(a===void 0||!(a instanceof d))throw new Error(`Invalid position data`);let t=fe$1.fromCartesian(a),e=await this.$viewerService.getHeight(t);if(e&&t.height!==e){let n=new fe$1(t.longitude,t.latitude,e);return fe$1.toCartesian(n)}else return a}catch(t){return console.info(`Detailed position calculation failed`),IC(t),a}}async getPositionCoordsDescription(a,t=this.$cursorCoordsService.selectedCrs(),e){try{if(a===void 0)return{latitudeDescription:`нет данных`,longitudeDescription:`нет данных`,heightDescription:`нет данных`,coordsDescription:`нет данных`};let n=this.$viewerService.viewer.scene.globe.ellipsoid.cartesianToCartographic(a),i=P$1.toDegrees(n.longitude),o=P$1.toDegrees(n.latitude),r=0;e?r=e:r=await this.$viewerService.getHeight(n);let l=wi.fromWGS84Cartographic(t,{latitude:o,longitude:i,height:r},``),u=``,g=``,y=``,q=``;return t===`СК-42 м`?(u=`X: ${l.latitude.toFixed(1)} \u043C`,g=`Y: ${l.longitude.toFixed(1)} \u043C`,y=`H: ${l.height.toFixed(1)} \u043C`,q=`${u}
${g}
${y}`):(u=`B: ${l.latitude.toFixed(7)} \u02DA`,g=`L: ${l.longitude.toFixed(7)} \u02DA`,y=`H: ${l.height.toFixed(1)} \u043C`,q=`${u}
${g}
${y}`),{latitudeDescription:u,longitudeDescription:g,heightDescription:y,coordsDescription:q}}catch(n){IC(n);return}}async getPositionCoordsNumbers(a,t=this.$cursorCoordsService.selectedCrs(),e){try{if(a===void 0)return{latitude:`нет данных`,longitude:`нет данных`,height:`нет данных`,crs:`нет данных`};let n=this.$viewerService.viewer.scene.globe.ellipsoid.cartesianToCartographic(a),i=P$1.toDegrees(n.longitude),o=P$1.toDegrees(n.latitude),r=0;e?r=e:r=await this.$viewerService.getHeight(n);let l=wi.fromWGS84Cartographic(t,{latitude:o,longitude:i,height:r},``),u=``,g=``,y=``;return t===`СК-42 м`?(u=l.latitude.toFixed(1),g=l.longitude.toFixed(1),y=l.height.toFixed(1)):(u=l.latitude.toFixed(7),g=l.longitude.toFixed(7),y=l.height.toFixed(1)),{latitude:u,longitude:g,height:y,crs:t}}catch(n){IC(n);return}}static ɵfac=function(t){return new(t||s)(K(iIe),K(Ca),K(rIe))};static ɵprov=P({token:s,factory:s.ɵfac})};function Mt(s){return s instanceof d?s:void 0}function Ye(s){return Array.isArray(s)?s.filter(a=>a instanceof d):[]}function Ze(s){return typeof s==`string`?s:void 0}function ei(s){return typeof s==`boolean`?s:void 0}function A(s){return typeof s==`number`?s:void 0}function St(s){return s instanceof U$1?s:void 0}function qe(s){if(!(typeof s!=`string`||s.trim()===``))return St(U$1.fromCssColorString(s))}function Ke(s){if(typeof s!=`object`||s===null||!(`color`in s))return;let a=St(s.color);return a?{color:a}:void 0}function ni(s){if(!(typeof s!=`object`||s===null||Array.isArray(s)))return Object.fromEntries(Object.entries(s))}function ii(s){return s instanceof z?s:void 0}function ai(s){return s instanceof kt?s:void 0}function Dt(s){return St(s)??Ke(s)?.color}function N(s){return s instanceof fh$1||s instanceof fD}function oi(s){if(!s?.ellipse)throw new Error(`Entity ellipse is undefined in getCircle()`);let a=Mt(s.position?.getValue()),t=A(s.ellipse.semiMajorAxis?.getValue()),e=A(s.ellipse.semiMinorAxis?.getValue());if(!a||t===void 0||e===void 0)throw new Error(`Entity is not valid in getCircle()`);let i=new Y1({center:a,semiMajorAxis:t,semiMinorAxis:e,rotation:A(s.ellipse.rotation?.getValue())??0,granularity:Math.PI/360}),o=Y1.createGeometry(i);if(!o)return[];let r=[];if(!o.attributes.position)throw new Error(`Ellipse geometry creation failure in getCircle()`);for(let l=0;l<o.attributes.position.values.length;l+=3)r.push(new d(o.attributes.position.values[l],o.attributes.position.values[l+1],o.attributes.position.values[l+2]));return r.push(r[0]),r}function ri(s,a){let t=fe$1.fromCartesian(s),e=fe$1.fromCartesian(a);return[d.fromRadians(t.longitude,t.latitude),d.fromRadians(t.longitude,e.latitude),d.fromRadians(e.longitude,e.latitude),d.fromRadians(e.longitude,t.latitude),d.fromRadians(t.longitude,t.latitude)]}var Te=Object.freeze([`drawMark`,`drawLine`,`drawRectangle`,`drawCircle`,`drawPolygon`]);function Ee(s){return Te.some(a=>a===s)}function Z(s){switch(s){case`drawMark`:return`Метка`;case`drawLine`:return`Линия`;case`drawRectangle`:return`Прямоугольник`;case`drawCircle`:return`Окружность`;case`drawPolygon`:return`Многоугольник`}}var Je=Object.freeze([Z(`drawMark`),Z(`drawLine`),Z(`drawRectangle`),Z(`drawCircle`),Z(`drawPolygon`)]);function ui(s){return Je.some(a=>a===s)}function bi(s){let a=Te.find(t=>Z(t)===s);if(a===void 0)throw new Error(`Unknown drawing tool label: ${s}`);return a}var xe=class s{constructor(a,t){this.$viewerService=a;this.$toolsService=t;this.findEntityPathInStore=this.$toolsService.findEntityPathInStore,this.drawingToolsLayerName=this.$toolsService.drawingToolsLayerName,this.drawRouteLayerName=this.$toolsService.drawRouteLayerName,cd(()=>{try{let e=!0;this.$viewerService.nowSceneModeDescription()===`2D`||this.$viewerService.nowSceneModeDescription()===`Columbus`?e=!1:e=!0,pu(()=>{this._temporalEntitiesList()?.length&&this.$toolsService.switchClampingToGroudForTemporalEntities(this._temporalEntitiesList,e,[`vectorPolygons`,`addAnnotation`,`addPhoto`,`addDome`,`heatmap`]),this._drawMarkEntitiesList()?.length&&this.$toolsService.switchClampingToGroudForOneStoreEntities(this._drawMarkEntitiesList,e),this._drawLineEntitiesList()?.length&&this.$toolsService.switchClampingToGroudForOneStoreEntities(this._drawLineEntitiesList,e),this._drawRectangleEntitiesList()?.length&&this.$toolsService.switchClampingToGroudForOneStoreEntities(this._drawRectangleEntitiesList,e),this._drawCircleEntitiesList()?.length&&this.$toolsService.switchClampingToGroudForOneStoreEntities(this._drawCircleEntitiesList,e),this._drawPolygonEntitiesList()?.length&&this.$toolsService.switchClampingToGroudForOneStoreEntities(this._drawPolygonEntitiesList,e),this._routeEntityList()?.length&&this.$toolsService.switchClampingToGroudForOneStoreEntities(this._routeEntityList,e)})}catch(e){IC(e)}})}$viewerService;$toolsService;cancelDrawingTool(){this.removeTemporalEntities(),this.$toolsService.clearCommonHandler()}_drawMarkEntitiesList=Nn$1([]);get drawMarkEntitiesList(){return this._drawMarkEntitiesList}isMarks=nw(()=>!!this._drawMarkEntitiesList().length);_drawLineEntitiesList=Nn$1([]);get drawLineEntitiesList(){return this._drawLineEntitiesList}isLines=nw(()=>!!this._drawLineEntitiesList().length);_drawRectangleEntitiesList=Nn$1([]);get drawRectangleEntitiesList(){return this._drawRectangleEntitiesList}isRectangles=nw(()=>!!this._drawRectangleEntitiesList().length);_drawCircleEntitiesList=Nn$1([]);get drawCircleEntitiesList(){return this._drawCircleEntitiesList}isCircles=nw(()=>!!this._drawCircleEntitiesList().length);_drawPolygonEntitiesList=Nn$1([]);get drawPolygonEntitiesList(){return this._drawPolygonEntitiesList}isPoligons=nw(()=>!!this._drawPolygonEntitiesList().length);_vectorPolygonsList=Nn$1([]);get vectorPolygonsList(){return this._vectorPolygonsList}isVectorPolygons=nw(()=>!!this._vectorPolygonsList().length);_annotationsList=Nn$1([]);get annotationsList(){return this._annotationsList}isAnnotations=nw(()=>!!this._annotationsList().length);_photosList=Nn$1([]);get photosList(){return this._photosList}isPhotos=nw(()=>!!this._photosList().length);_addDomeEntitiesList=Nn$1([]);get addDomeEntitiesList(){return this._addDomeEntitiesList}isDomes=nw(()=>!!this._addDomeEntitiesList().length);_heatmapList=Nn$1([]);get heatmapList(){return this._heatmapList}isHeatmap=nw(()=>!!this._addDomeEntitiesList().length);_routeEntityList=Nn$1([]);get routeEntityList(){return this._routeEntityList}isRoutes=nw(()=>!!this._routeEntityList().length);_allEntitiesListsLinks={drawMark:this._drawMarkEntitiesList,drawLine:this._drawLineEntitiesList,drawRectangle:this._drawRectangleEntitiesList,drawCircle:this._drawCircleEntitiesList,drawPolygon:this._drawPolygonEntitiesList};get allEntitiesListsLinks(){return this._allEntitiesListsLinks}_overEntitiesList=Nn$1([]);get overEntitiesList(){return this._overEntitiesList}isOver=nw(()=>!!this._overEntitiesList().length);_temporalEntitiesList=Nn$1([]);get temporalEntitiesList(){return this._temporalEntitiesList}removeEntitiesByGroupId(a,t,e=this.drawingToolsLayerName){try{if(!t().length)return!1;if(a===void 0)return console.info(`Entities group to delete is not defined (by removeEntitiesByGroupId fn)`),!1;let n=[],i=t().findIndex(l=>l?.groupId.startsWith(a)),o=t()[i];if(i!==-1&&o?.entitiesList){for(let l of o.entitiesList)l&&n.push(l.id);t.update(l=>(l.splice(i,1),[...l]))}else return console.info(`Entities group to delete haven't found in entitiesStore (by removeEntitiesByGroupId fn)`),!1;let r=this?.$viewerService.viewer.dataSources?.getByName(`${e}`)?.[0];if(r)for(let l of n)r.entities.removeById(l);else return console.info(`dataSource is undefined (by removeEntitiesByGroupId fn)`),!1;return!0}catch(n){return IC(n),!1}}removeOneEntityByGroupId(a,t,e=this.drawingToolsLayerName){try{if(!t().length)return!1;let n=t().findIndex(o=>o?.groupId.startsWith(a));if(n!==-1&&t()[n]?.entitiesList)t.update(o=>(o.splice(n,1),[...o]));else return console.info(`Entity Id hasn't found in entitiesStore (by removeOneEntityByGroupId fn)`),!1;let i=this?.$viewerService.viewer.dataSources?.getByName(`${e}`)?.[0];return i?i.entities.removeById(a):(console.info(`dataSource is undefined (by removeOneEntityByGroupId fn)`),!1)}catch(n){return IC(n),!1}}allToolEntitiesCleaning(a,t=this.drawingToolsLayerName){try{if(!a)throw new Error(`toolName is undefined in allToolEntitiesCleaning fn`);if(!Ee(a))return!0;if(!this._allEntitiesListsLinks[a])throw new Error(`targetStore is undefined in allToolEntitiesCleaning fn`);let e=this._allEntitiesListsLinks[a];if(!e().length)return console.info(`targetStore is already empty (by allToolEntitiesCleaning fn)`),!1;let n=[];for(let o of e())if(o?.entitiesList.length)for(let r of o.entitiesList)r&&n.push(r.id);if(n.length)e.update(()=>[]);else return console.info(`Nothing to erase in targetStore (by allToolEntitiesCleaning fn)`),!1;let i=this?.$viewerService.viewer.dataSources?.getByName(`${t}`)?.[0];if(i)for(let o of n)i.entities.removeById(o);else return console.info(`dataSource is undefined (by allToolEntitiesCleaning fn)`),!1;return!0}catch(e){return IC(e),!1}}allOversEntitiesCleaning(a=this.drawingToolsLayerName){try{let t=this._overEntitiesList;if(!t().length)return console.info(`targetStore is already empty (by allOversEntitiesCleaning fn)`),!1;let e=[];for(let i of t())if(i?.entitiesList.length)for(let o of i.entitiesList)o&&e.push(o.id);if(e.length)t.update(()=>[]);else return console.info(`Nothing to erase in targetStore (by allOversEntitiesCleaning fn)`),!1;let n=this?.$viewerService.viewer.dataSources?.getByName(`${a}`)?.[0];if(n)for(let i of e)n.entities.removeById(i);else return console.info(`dataSource is undefined (by allOversEntitiesCleaning fn)`),!1;return!0}catch(t){return IC(t),!1}}clearDrawingsDataSource(){try{let a=this?.$viewerService.viewer.dataSources?.getByName(this.drawingToolsLayerName)?.[0];if(a)a.entities.removeAll();else return console.info(`dataSource is undefined (by clearDrawingsDataSource fn)`),!1;return Object.values(this._allEntitiesListsLinks).concat(this._overEntitiesList).forEach(e=>{e!==this._routeEntityList&&e.update(()=>[])}),!0}catch(a){return IC(a),!1}}clearRouteDataSources(){try{let a=this?.$viewerService.viewer.dataSources?.getByName(`drawRoute`)?.[0];if(a)a.entities.removeAll();else return console.info(`dataSource is undefined (by clearRouteDataSources fn)`),!1;return this._routeEntityList.update(()=>[]),!0}catch(a){return IC(a),!1}}changeDefaultEntityInGroup(a,t,e){try{let n=e?this._allEntitiesListsLinks[e]:this._overEntitiesList,i=n().findIndex(o=>o?.groupId===a);if(i!==-1)n.update(o=>{let r=o[i];return r&&(r.defaultEntity=t||void 0),[...o]});else return console.info(`groupId hasn't found in changeDefaultEntityInGroup fn`),!1;return!0}catch(n){return IC(n),!1}}pushGroupFromTemporal(a,t,e){try{let n=t?this._allEntitiesListsLinks[t]:this._overEntitiesList,i=n().findIndex(o=>o?.groupId===a);return i===-1?n.update(o=>(o.push({groupId:a,entitiesList:this._temporalEntitiesList(),defaultEntity:e||void 0}),[...o])):n.update(o=>(o[i]?.entitiesList.push(...this._temporalEntitiesList()),[...o])),!0}catch(n){return IC(n),!1}}pushGroupWithoutTemporal(a,t,e,n){try{if(!a.length)throw new Error(`None entities in pushGroupWithoutTemporal fn`);let i=e?this._allEntitiesListsLinks[e]:this._overEntitiesList,o=i().findIndex(r=>r?.groupId===t);return o===-1?i.update(r=>(r.push({groupId:t,entitiesList:a,defaultEntity:n||void 0}),[...r])):i.update(r=>(r[o]?.entitiesList.push(...a),[...r])),!0}catch(i){return IC(i),!1}}pushGroupWithoutTemporalWithDrawing(a,t,e,n){try{if(!a||!a?.length)throw new Error(`None entities in pushGroupWithoutTemporal fn`);let i=[],o;if(o=this.$viewerService.viewer.dataSources?.getByName(this.drawingToolsLayerName)?.[0],o!==void 0)for(let r of a){if(!r?.id)continue;if(o.entities.values.findIndex(u=>u.id===r.id)!==-1){console.info(`Entity already exists on draw layer and will be loose (in pushGroupWithoutTemporalWithDrawing fn)`);continue}i.push(r)}else i=a;if(!i.length)return console.info(`No valid entities on pushing "${e}" entities in store (in pushGroupWithoutTemporalWithDrawing fn)`),!1;if(this.pushGroupWithoutTemporal(i,t,e,n)===!0){for(let r of i)r&&this.addNewEntityToDrawLayer(r);return!0}else return!1}catch(i){return IC(i),!1}}clearTemporalEntitiesList(a){try{return this._temporalEntitiesList().length?a?this._temporalEntitiesList.update(t=>(t=t.filter(e=>!e?.id.startsWith(a)),[...t])):this._temporalEntitiesList.set([]):console.info(`_temporalEntitiesList() is empty in clearTemporalEntitiesList fn`),!0}catch(t){return IC(t),!1}}removeTemporalEntities(a,t=this.drawingToolsLayerName){try{if(!this._temporalEntitiesList().length)return!1;let e=[];if(a)for(let i of this._temporalEntitiesList())i?.id.startsWith(a)&&e.push(i.id);else for(let i of this._temporalEntitiesList())i&&e.push(i.id);if(this.clearTemporalEntitiesList(a)){let i=this?.$viewerService.viewer.dataSources?.getByName(`${t}`)?.[0];if(i){for(let o of e)i.entities.removeById(o);return!0}else return console.info(`dataSource is undefined (by removeTemporalEntities fn)`),!1}else return console.info(`Temporal store clearing has failed (by removeTemporalEntities fn)`),!1}catch(e){return IC(e),!1}}addNewEntityToDrawLayer(a){let t=this?.$viewerService.viewer.dataSources?.getByName(this.drawingToolsLayerName)?.[0];return t?(t.entities.add(a),!0):(console.info(`Data source hasn't found in addNewEntityToDrawLayer fn`),!1)}addNewEntityToDrawRoute(a){if(!a||!(a instanceof Hi))return console.info(`Invalid entity in addNewEntityToDrawRoute fn`),!1;let t=this?.$viewerService.viewer.dataSources?.getByName(this.$toolsService.drawRouteLayerName)?.[0];return t?(t.entities.add(a),!0):(console.info(`Data source hasn't found in addNewEntityToDrawRoute fn`),!1)}setEntityConstantsTimeouts={};setEntityConstants(a){let t=a;if(!t||typeof t!=`string`)throw new Error(`Invalid entity's ID in setEntityConstants fn`);this.setEntityConstantsTimeouts?.[t]&&clearTimeout(this.setEntityConstantsTimeouts[t]);let e=t.split(`-`)[1];if(e&&Ee(e))this.setEntityConstantsTimeouts[t]=setTimeout(n=>{this.$toolsService.setConstantsForStoreEntities(this.allEntitiesListsLinks[e],n)},this.$toolsService.setEntityConstantsTimer,t);else throw new Error(`Invalid entity's tool's name in setEntityConstants fn`)}static ɵfac=function(t){return new(t||s)(K(iIe),K(Y))};static ɵprov=P({token:s,factory:s.ɵfac})};var Xe=Object.freeze([`calculateLine`,`calculateRectangle`,`calculateCircle`,`calculatePolygon`]);function Qe(s){return Xe.some(a=>a===s)}function yi(s){switch(s){case`calculateLine`:return`Дистанция`;case`calculateRectangle`:return`Прямоугольная площадь`;case`calculateCircle`:return`Площадь окружности`;case`calculatePolygon`:return`Площадь многоугольника`}}var Le=class s{constructor(a,t){this.$viewerService=a;this.$toolsService=t;cd(()=>{try{let e=!0;this.$viewerService.nowSceneModeDescription()===`2D`||this.$viewerService.nowSceneModeDescription()===`Columbus`?e=!1:e=!0,pu(()=>{this._temporalEntitiesList()?.length&&this.$toolsService.switchClampingToGroudForTemporalEntities(this._temporalEntitiesList,e,[]),this._linearMesurmentsLinesList()?.length&&this.$toolsService.switchClampingToGroudForOneStoreEntities(this._linearMesurmentsLinesList,e),this._rectangleAreaMesurmentsList()?.length&&this.$toolsService.switchClampingToGroudForOneStoreEntities(this._rectangleAreaMesurmentsList,e),this._calculateCircleList()?.length&&this.$toolsService.switchClampingToGroudForOneStoreEntities(this._calculateCircleList,e),this._calculatePolygonList()?.length&&this.$toolsService.switchClampingToGroudForOneStoreEntities(this._calculatePolygonList,e)})}catch(e){IC(e)}})}$viewerService;$toolsService;cancelMeasuringTool(){this.removeTemporalEntities(),this.$toolsService.clearCommonHandler()}_linearMesurmentsLinesList=Nn$1([]);get linearMeasurmentsLinesList(){return this._linearMesurmentsLinesList}isLines=nw(()=>!!this._linearMesurmentsLinesList().length);_rectangleAreaMesurmentsList=Nn$1([]);get rectangleAreaMeasurmentsList(){return this._rectangleAreaMesurmentsList}isRectangles=nw(()=>!!this._rectangleAreaMesurmentsList().length);_calculateCircleList=Nn$1([]);get calculateCircleList(){return this._calculateCircleList}isCircles=nw(()=>!!this._calculateCircleList().length);_calculatePolygonList=Nn$1([]);get calculatePolygonList(){return this._calculatePolygonList}isPoligons=nw(()=>!!this._calculatePolygonList().length);_allEntitiesListsLinks={calculateLine:this._linearMesurmentsLinesList,calculateRectangle:this._rectangleAreaMesurmentsList,calculateCircle:this._calculateCircleList,calculatePolygon:this._calculatePolygonList};get allEntitiesListsLinks(){return this._allEntitiesListsLinks}_temporalEntitiesList=Nn$1([]);get temporalEntitiesList(){return this._temporalEntitiesList}removeEntitiesByGroupId(a,t,e=this.$toolsService.measuringToolsLayerName){try{if(!t().length)return!1;if(a===void 0)return console.info(`Entities group to delete is not defined (by removeEntitiesByGroupId fn)`),!1;let n=[],i=t().findIndex(l=>l?.groupId.startsWith(a)),o=t()[i];if(i!==-1&&o?.entitiesList){for(let l of o.entitiesList)l&&n.push(l.id);t.update(l=>(l.splice(i,1),[...l]))}else return console.info(`Entities group to delete haven't found in entitiesStore (by removeEntitiesByGroupId fn)`),!1;let r=this?.$viewerService.viewer.dataSources?.getByName(`${e}`)?.[0];if(r)for(let l of n)r.entities.removeById(l);else return console.info(`dataSource is undefined (by removeEntitiesByGroupId fn)`),!1;return!0}catch(n){return IC(n),!1}}removeOneEntityByGroupId(a,t,e=this.$toolsService.measuringToolsLayerName){try{if(!t().length)return!1;let n=t().findIndex(o=>o?.groupId.startsWith(a));if(n!==-1&&t()[n]?.entitiesList)t.update(o=>(o.splice(n,1),[...o]));else return console.info(`Entity Id hasn't found in entitiesStore (by removeOneEntityByGroupId fn)`),!1;let i=this?.$viewerService.viewer.dataSources?.getByName(`${e}`)?.[0];return i?i.entities.removeById(a):(console.info(`dataSource is undefined (by removeOneEntityByGroupId fn)`),!1)}catch(n){return IC(n),!1}}allToolEntitiesCleaning(a,t=this.$toolsService.measuringToolsLayerName){try{if(!a)throw new Error(`toolName is undefined in allToolEntitiesCleaning fn`);if(!Qe(a))return!0;if(!this._allEntitiesListsLinks[a])throw new Error(`targetStore is undefined in allToolEntitiesCleaning fn`);let e=this._allEntitiesListsLinks[a];if(!e().length)return console.info(`targetStore is already empty (by allToolEntitiesCleaning fn)`),!1;let n=[];for(let o of e())if(o?.entitiesList.length)for(let r of o.entitiesList)r&&n.push(r.id);if(n.length)e.update(()=>[]);else return console.info(`Nothing to erase in targetStore (by allToolEntitiesCleaning fn)`),!1;let i=this?.$viewerService.viewer.dataSources?.getByName(`${t}`)?.[0];if(i)for(let o of n)i.entities.removeById(o);else return console.info(`dataSource is undefined (by allToolEntitiesCleaning fn)`),!1;return!0}catch(e){return IC(e),!1}}clearMeasuresDataSource(){try{let a=this?.$viewerService.viewer.dataSources?.getByName(this.$toolsService.measuringToolsLayerName)?.[0];if(a)a.entities.removeAll();else return console.info(`dataSource is undefined (by clearMeasuresDataSource fn)`),!1;return Object.values(this._allEntitiesListsLinks).forEach(e=>{e.update(()=>[])}),!0}catch(a){return IC(a),!1}}changeDefaultEntityInGroup(a,t,e){try{let n=this._allEntitiesListsLinks[e],i=n().findIndex(o=>o?.groupId===a);if(i!==-1)n.update(o=>{let r=o[i];return r&&(r.defaultEntity=t||void 0),[...o]});else return console.info(`groupId hasn't found in changeDefaultEntityInGroup fn`),!1;return!0}catch(n){return IC(n),!1}}pushGroupFromTemporal(a,t,e){try{if(t===void 0)return console.info(`toolName is undefined in pushGroupFromTemporal fn`),!1;let n=this._allEntitiesListsLinks[t],i=n().findIndex(o=>o?.groupId===a);return i===-1?n.update(o=>(o.push({groupId:a,entitiesList:this._temporalEntitiesList(),defaultEntity:e||void 0}),[...o])):n.update(o=>(o[i]?.entitiesList.push(...this._temporalEntitiesList()),[...o])),!0}catch(n){return IC(n),!1}}pushGroupWithoutTemporal(a,t,e,n){try{if(e===void 0)return console.info(`toolName is undefined in pushGroupWithoutTemporal fn`),!1;if(!a.length)throw new Error(`None entities in pushGroupWithoutTemporal fn`);let i=this._allEntitiesListsLinks[e],o=i().findIndex(r=>r?.groupId===t);return o===-1?i.update(r=>(r.push({groupId:t,entitiesList:a,defaultEntity:n||void 0}),[...r])):i.update(r=>(r[o]?.entitiesList.push(...a),[...r])),!0}catch(i){return IC(i),!1}}pushGroupWithoutTemporalWithDrawing(a,t,e,n){try{if(e===void 0)return console.info(`toolName is undefined in pushGroupWithoutTemporalWithDrawing fn`),!1;if(!a.length)throw new Error(`None entities in pushGroupWithoutTemporal fn`);if(this.pushGroupWithoutTemporal(a,t,e,n)===!0){for(let i of a)i&&this.addNewEntityToMeasureLayer(i);return!0}else return!1}catch(i){return IC(i),!1}}clearTemporalEntitiesList(a){try{return this._temporalEntitiesList().length?a?this._temporalEntitiesList.update(t=>(t=t.filter(e=>!e?.id.startsWith(a)),[...t])):this._temporalEntitiesList.set([]):console.info(`_temporalEntitiesList() is empty in clearTemporalEntitiesList fn`),!0}catch(t){return IC(t),!1}}removeTemporalEntities(a,t=this.$toolsService.measuringToolsLayerName){try{if(!this._temporalEntitiesList().length)return!1;let e=[];if(a)for(let i of this._temporalEntitiesList())i?.id.startsWith(a)&&e.push(i.id);else for(let i of this._temporalEntitiesList())i&&e.push(i.id);if(this.clearTemporalEntitiesList(a)){let i=this?.$viewerService.viewer.dataSources?.getByName(`${t}`)?.[0];if(i){for(let o of e)i.entities.removeById(o);return!0}else return console.info(`dataSource is undefined (by removeTemporalEntities fn)`),!1}else return console.info(`Temporal store clearing has failed (by removeTemporalEntities fn)`),!1}catch(e){return IC(e),!1}}addNewEntityToMeasureLayer(a){if(!a||!(a instanceof Hi))return console.info(`Invalid entity in addNewEntityToMeasureLayer fn`),!1;let t=this?.$viewerService.viewer.dataSources?.getByName(this.$toolsService.measuringToolsLayerName)?.[0];return t?(t.entities.add(a),!0):(console.info(`Data source hasn't found in addNewEntityToMeasureLayer fn`),!1)}static ɵfac=function(t){return new(t||s)(K(iIe),K(Y))};static ɵprov=P({token:s,factory:s.ɵfac})};export{qe as C,xe as D,wn as E,yi as O,oi as S,ui as T,bi as _,Mt as a,jn as b,Re as c,Wn as d,Y as f,ai as g,Ze as h,Le as i,St as l,Z as m,Ee as n,Nn as o,Ye as p,Ke as r,Qe as s,A as t,Te as u,ei as v,ri as w,ni as x,ii as y};