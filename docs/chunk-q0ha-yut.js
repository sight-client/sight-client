import{t as r}from"./chunk-Bzu7LT3n.js";import{At as T0,C as Ee$1,Dn as eT,Dt as S,Ft as Us,Gt as Wa,Ir as zh,It as VD,Jt as X,Mr as yh,Nn as hh,O as Fl,Ot as S0,P as Gh,Pr as zc,R as HD,Rr as zu,St as Q,Wt as WT,Xt as Xl,Z as K,ar as qE,bt as Pl,c as Ar,ct as N0,fr as rt,g as Cg,gn as bg,gr as tT,gt as Oh,hr as sn,ir as pr,jr as yT,kn as es,kr as xr,mn as b,mt as Oe,n as $E,nr as os,r as $T,rt as Lg,tt as Kp,vn as bn,vr as uI,wn as de$1,wt as Qc,xn as ce$1,y as Cr,z as HE}from"./chunk-CtLreyQj.js";import{t as n}from"./chunk-JbDJhq-j.js";import{B as dh,C as U,D as Yi,E as Yg,J as kt,L as ci,N as ao,O as Z1,S as T5,V as fe$1,_ as Nn,at as xIe,c as Ei,ct as z,d as Ht,g as N1,p as IR,s as Dw,v as Ow,w as We,x as Sl,y as P,z as d}from"./chunk-BZFpjwGV.js";import{f as fi,h as ri,p as ie}from"./chunk-gTxRppn0.js";import{B as ft,C as Us$1,P as e0,Z as ns,b as Ro,c as Cr$1,d as It,dt as wn,k as bl,l as DS,m as Ml,p as Mc,t as AS}from"./chunk--TigjVhz.js";var ge={capture:!0};var ve=[`focus`,`mousedown`,`mouseenter`,`touchstart`];var St=`mat-ripple-loader-uninitialized`;var Nt=`mat-ripple-loader-class-name`;var oe=`mat-ripple-loader-centered`;var ut=`mat-ripple-loader-disabled`;var re=(()=>{class s{_document=b(pr);_animationsDisabled=ri();_globalRippleOptions=b(e0,{optional:!0});_platform=b(ie);_ngZone=b(ce$1);_injector=b(Ee$1);_eventCleanups;_hosts=new Map;constructor(){let t=b(Cr).createRenderer(null,null);this._eventCleanups=this._ngZone.runOutsideAngular(()=>ve.map(e=>t.listen(this._document,e,this._onInteraction,ge)))}ngOnDestroy(){let t=this._hosts.keys();for(let e of t)this.destroyRipple(e);this._eventCleanups.forEach(e=>e())}configureRipple(t,e){t.setAttribute(St,this._globalRippleOptions?.namespace??``),(e.className||!t.hasAttribute(Nt))&&t.setAttribute(Nt,e.className||``),e.centered&&t.setAttribute(oe,``),e.disabled&&t.setAttribute(ut,``)}setDisabled(t,e){let n=this._hosts.get(t);n?(n.target.rippleDisabled=e,!e&&!n.hasSetUpEvents&&(n.hasSetUpEvents=!0,n.renderer.setupTriggerEvents(t))):e?t.setAttribute(ut,``):t.removeAttribute(ut)}_onInteraction=t=>{let e=ft(t);if(e instanceof HTMLElement){let n=e.closest(`[${St}="${this._globalRippleOptions?.namespace??``}"]`);n&&this._createRipple(n)}};_createRipple(t){if(!this._document||this._hosts.has(t))return;t.querySelector(`.mat-ripple`)?.remove();let e=this._document.createElement(`span`);e.classList.add(`mat-ripple`,t.getAttribute(Nt)),t.append(e);let n=this._globalRippleOptions,a=this._animationsDisabled?0:n?.animation?.enterDuration??bl.enterDuration,o=this._animationsDisabled?0:n?.animation?.exitDuration??bl.exitDuration,r={rippleDisabled:this._animationsDisabled||n?.disabled||t.hasAttribute(ut),rippleConfig:{centered:t.hasAttribute(oe),terminateOnPointerUp:n?.terminateOnPointerUp,animation:{enterDuration:a,exitDuration:o}}},c=new wn(r,this._ngZone,e,this._platform,this._injector),d=!r.rippleDisabled;d&&c.setupTriggerEvents(t),this._hosts.set(t,{target:r,renderer:c,hasSetUpEvents:d}),t.removeAttribute(St)}destroyRipple(t){let e=this._hosts.get(t);e&&(e.renderer._removeTriggerEvents(),this._hosts.delete(t))}static ɵfac=function(e){return new(e||s)};static ɵprov=xr({token:s,factory:s.ɵfac})}return s})();var ye=[`*`,[[``,`progressIndicator`,``]]];var Se=[`*`,`[progressIndicator]`];function Ne(s,i){s&1&&(zc(0,`div`,1),tT(1,1),Qc())}var Ce=new S(`MAT_BUTTON_CONFIG`);function se(s){return s==null?void 0:S0(s)}var Ct=(()=>{class s{_elementRef=b(Ar);_ngZone=b(ce$1);_animationsDisabled=ri();_config=b(Ce,{optional:!0});_focusMonitor=b(ns);_cleanupClick;_renderer=b(Wa);_rippleLoader=b(re);_isAnchor;_isFab=!1;color;get disableRipple(){return this._disableRipple}set disableRipple(t){this._disableRipple=t,this._updateRippleDisabled()}_disableRipple=!1;get disabled(){return this._disabled}set disabled(t){this._disabled=t,this._updateRippleDisabled()}_disabled=!1;ariaDisabled;disabledInteractive;tabIndex;set _tabindex(t){this.tabIndex=t}showProgress=T0(!1,{transform:N0});constructor(){b(It).load(AS);let t=this._elementRef.nativeElement;this._isAnchor=t.tagName===`A`,this.disabledInteractive=this._config?.disabledInteractive??!1,this.color=this._config?.color??null,this._rippleLoader?.configureRipple(t,{className:`mat-mdc-button-ripple`})}ngAfterViewInit(){this._focusMonitor.monitor(this._elementRef,!0),this._isAnchor&&this._setupAsAnchor()}ngOnDestroy(){this._cleanupClick?.(),this._focusMonitor.stopMonitoring(this._elementRef),this._rippleLoader?.destroyRipple(this._elementRef.nativeElement)}focus(t=`program`,e){t?this._focusMonitor.focusVia(this._elementRef.nativeElement,t,e):this._elementRef.nativeElement.focus(e)}_getAriaDisabled(){return this.ariaDisabled!=null?this.ariaDisabled:this._isAnchor?this.disabled||null:this.disabled&&this.disabledInteractive?!0:null}_getDisabledAttribute(){return this.disabledInteractive||!this.disabled?null:!0}_updateRippleDisabled(){this._rippleLoader?.setDisabled(this._elementRef.nativeElement,this.disableRipple||this.disabled)}_getTabIndex(){return this._isAnchor?this.disabled&&!this.disabledInteractive?-1:this.tabIndex:this.tabIndex}_setupAsAnchor(){this._cleanupClick=this._ngZone.runOutsideAngular(()=>this._renderer.listen(this._elementRef.nativeElement,`click`,t=>{this.disabled&&(t.preventDefault(),t.stopImmediatePropagation())}))}static ɵfac=function(e){return new(e||s)};static ɵdir=qE({type:s,hostAttrs:[1,`mat-mdc-button-base`],hostVars:15,hostBindings:function(e,n){e&2&&(hh(`disabled`,n._getDisabledAttribute())(`aria-disabled`,n._getAriaDisabled())(`tabindex`,n._getTabIndex()),yT(n.color?`mat-`+n.color:``),Oh(`mat-mdc-button-progress-indicator-shown`,n.showProgress())(`mat-mdc-button-disabled`,n.disabled)(`mat-mdc-button-disabled-interactive`,n.disabledInteractive)(`mat-unthemed`,!n.color)(`_mat-animation-noopable`,n._animationsDisabled))},inputs:{color:`color`,disableRipple:[2,`disableRipple`,`disableRipple`,N0],disabled:[2,`disabled`,`disabled`,N0],ariaDisabled:[2,`aria-disabled`,`ariaDisabled`,N0],disabledInteractive:[2,`disabledInteractive`,`disabledInteractive`,N0],tabIndex:[2,`tabIndex`,`tabIndex`,se],_tabindex:[2,`tabindex`,`_tabindex`,se],showProgress:[1,`showProgress`]}})}return s})();var we=(()=>{class s extends Ct{constructor(){super(),this._rippleLoader.configureRipple(this._elementRef.nativeElement,{centered:!0})}static ɵfac=function(e){return new(e||s)};static ɵcmp=HE({type:s,selectors:[[`button`,`mat-icon-button`,``],[`a`,`mat-icon-button`,``],[`button`,`matIconButton`,``],[`a`,`matIconButton`,``]],hostAttrs:[1,`mdc-icon-button`,`mat-mdc-icon-button`],exportAs:[`matButton`,`matAnchor`],features:[Kp],ngContentSelectors:Se,decls:5,vars:1,consts:[[1,`mat-mdc-button-persistent-ripple`,`mdc-icon-button__ripple`],[1,`mat-mdc-button-progress-indicator-container`],[1,`mat-focus-indicator`],[1,`mat-mdc-button-touch-target`]],template:function(e,n){e&1&&(eT(ye),yh(0,`span`,0),tT(1),VD(2,Ne,2,0,`div`,1),yh(3,`span`,2)(4,`span`,3)),e&2&&(uI(2),HD(n.showProgress()?2:-1))},styles:[`.mat-mdc-icon-button {
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
`],encapsulation:2})}return s})();var _e=[[[``,8,`material-icons`,3,`iconPositionEnd`,``],[`mat-icon`,3,`iconPositionEnd`,``],[``,`matButtonIcon`,``,3,`iconPositionEnd`,``]],`*`,[[``,`iconPositionEnd`,``,8,`material-icons`],[`mat-icon`,`iconPositionEnd`,``],[``,`matButtonIcon`,``,`iconPositionEnd`,``]],[[``,`progressIndicator`,``]]];var xe=[`.material-icons:not([iconPositionEnd]), mat-icon:not([iconPositionEnd]), [matButtonIcon]:not([iconPositionEnd])`,`*`,`.material-icons[iconPositionEnd], mat-icon[iconPositionEnd], [matButtonIcon][iconPositionEnd]`,`[progressIndicator]`];function Ee(s,i){s&1&&(zc(0,`div`,2),tT(1,3),Qc())}var le=new Map([[`text`,[`mat-mdc-button`]],[`filled`,[`mdc-button--unelevated`,`mat-mdc-unelevated-button`]],[`elevated`,[`mdc-button--raised`,`mat-mdc-raised-button`]],[`outlined`,[`mdc-button--outlined`,`mat-mdc-outlined-button`]],[`tonal`,[`mat-tonal-button`]]]);var on=(()=>{class s extends Ct{get appearance(){return this._appearance}set appearance(t){this.setAppearance(t||this._config?.defaultAppearance||`text`)}_appearance=null;constructor(){super();let t=Te(this._elementRef.nativeElement);t&&this.setAppearance(t)}setAppearance(t){if(t===this._appearance)return;let e=this._elementRef.nativeElement.classList,n=this._appearance?le.get(this._appearance):null,a=le.get(t);n&&e.remove(...n),e.add(...a),this._appearance=t}static ɵfac=function(e){return new(e||s)};static ɵcmp=HE({type:s,selectors:[[`button`,`matButton`,``],[`a`,`matButton`,``],[`button`,`mat-button`,``],[`button`,`mat-raised-button`,``],[`button`,`mat-flat-button`,``],[`button`,`mat-stroked-button`,``],[`a`,`mat-button`,``],[`a`,`mat-raised-button`,``],[`a`,`mat-flat-button`,``],[`a`,`mat-stroked-button`,``]],hostAttrs:[1,`mdc-button`],inputs:{appearance:[0,`matButton`,`appearance`]},exportAs:[`matButton`,`matAnchor`],features:[Kp],ngContentSelectors:xe,decls:8,vars:5,consts:[[1,`mat-mdc-button-persistent-ripple`],[1,`mdc-button__label`],[1,`mat-mdc-button-progress-indicator-container`],[1,`mat-focus-indicator`],[1,`mat-mdc-button-touch-target`]],template:function(e,n){e&1&&(eT(_e),yh(0,`span`,0),tT(1),zc(2,`span`,1),tT(3,1),Qc(),tT(4,2),VD(5,Ee,2,0,`div`,2),yh(6,`span`,3)(7,`span`,4)),e&2&&(Oh(`mdc-button__ripple`,!n._isFab)(`mdc-fab__ripple`,n._isFab),uI(5),HD(n.showProgress()?5:-1))},styles:[`.mat-mdc-button-base {
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
`],encapsulation:2})}return s})();function Te(s){return s.hasAttribute(`mat-raised-button`)?`elevated`:s.hasAttribute(`mat-stroked-button`)?`outlined`:s.hasAttribute(`mat-flat-button`)?`filled`:s.hasAttribute(`mat-button`)?`text`:null}var rn=(()=>{class s{static ɵfac=function(e){return new(e||s)};static ɵmod=$E({type:s});static ɵinj=Xl({imports:[DS,fi]})}return s})();function ce(s){return Error(`Unable to find icon with the name "${s}"`)}function Ie(){return Error(`Could not find HttpClient for use with Angular Material icons. Please add provideHttpClient() to your providers.`)}function de(s){return Error(`The URL provided to MatIconRegistry was not trusted as a resource URL via Angular's DomSanitizer. Attempted URL was "${s}".`)}function me(s){return Error(`The literal provided to MatIconRegistry was not trusted as safe HTML by Angular's DomSanitizer. Attempted literal was "${s}".`)}var x=class{url;svgText;options;svgElement=null;constructor(i,t,e){this.url=i,this.svgText=t,this.options=e}};var be=(()=>{class s{_httpClient;_sanitizer;_errorHandler;_document;_svgIconConfigs=new Map;_iconSetConfigs=new Map;_cachedIconsByUrl=new Map;_inProgressUrlFetches=new Map;_fontCssClassesByAlias=new Map;_resolvers=[];_defaultFontSetClass=[`material-icons`,`mat-ligature-font`];constructor(t,e,n,a){this._httpClient=t,this._sanitizer=e,this._errorHandler=a,this._document=n}addSvgIcon(t,e,n){return this.addSvgIconInNamespace(``,t,e,n)}addSvgIconLiteral(t,e,n){return this.addSvgIconLiteralInNamespace(``,t,e,n)}addSvgIconInNamespace(t,e,n,a){return this._addSvgIconConfig(t,e,new x(n,null,a))}addSvgIconResolver(t){return this._resolvers.push(t),this}addSvgIconLiteralInNamespace(t,e,n,a){let o=this._sanitizer.sanitize(Us.HTML,n);if(!o)throw me(n);let r=Mc(o);return this._addSvgIconConfig(t,e,new x(``,r,a))}addSvgIconSet(t,e){return this.addSvgIconSetInNamespace(``,t,e)}addSvgIconSetLiteral(t,e){return this.addSvgIconSetLiteralInNamespace(``,t,e)}addSvgIconSetInNamespace(t,e,n){return this._addSvgIconSetConfig(t,new x(e,null,n))}addSvgIconSetLiteralInNamespace(t,e,n){let a=this._sanitizer.sanitize(Us.HTML,e);if(!a)throw me(e);let o=Mc(a);return this._addSvgIconSetConfig(t,new x(``,o,n))}registerFontClassAlias(t,e=t){return this._fontCssClassesByAlias.set(t,e),this}classNameForFontAlias(t){return this._fontCssClassesByAlias.get(t)||t}setDefaultFontSetClass(...t){return this._defaultFontSetClass=t,this}getDefaultFontSetClass(){return this._defaultFontSetClass}getSvgIconFromUrl(t){let e=this._sanitizer.sanitize(Us.RESOURCE_URL,t);if(!e)throw de(t);let n=this._cachedIconsByUrl.get(e);return n?bg(bt(n)):this._loadSvgIconFromConfig(new x(t,null)).pipe(Fl(a=>this._cachedIconsByUrl.set(e,a)),de$1(a=>bt(a)))}getNamedSvgIcon(t,e=``){let n=ue(e,t),a=this._svgIconConfigs.get(n);if(a)return this._getSvgFromConfig(a);if(a=this._getIconConfigFromResolvers(e,t),a)return this._svgIconConfigs.set(n,a),this._getSvgFromConfig(a);let o=this._iconSetConfigs.get(e);return o?this._getSvgFromIconSetConfigs(t,o):Cg(ce(n))}ngOnDestroy(){this._resolvers=[],this._svgIconConfigs.clear(),this._iconSetConfigs.clear(),this._cachedIconsByUrl.clear()}_getSvgFromConfig(t){return t.svgText?bg(bt(this._svgElementFromConfig(t))):this._loadSvgIconFromConfig(t).pipe(de$1(e=>bt(e)))}_getSvgFromIconSetConfigs(t,e){let n=this._extractIconWithNameFromAnySet(t,e);if(n)return bg(n);return Lg(e.filter(o=>!o.svgText).map(o=>this._loadSvgIconSetFromConfig(o).pipe(es(r=>{let d=`Loading icon set URL: ${this._sanitizer.sanitize(Us.RESOURCE_URL,o.url)} failed: ${r.message}`;return this._errorHandler.handleError(new Error(d)),bg(null)})))).pipe(de$1(()=>{let o=this._extractIconWithNameFromAnySet(t,e);if(!o)throw ce(t);return o}))}_extractIconWithNameFromAnySet(t,e){for(let n=e.length-1;n>=0;n--){let a=e[n];if(a.svgText&&a.svgText.toString().indexOf(t)>-1){let o=this._svgElementFromConfig(a),r=this._extractSvgIconFromSet(o,t,a.options);if(r)return r}}return null}_loadSvgIconFromConfig(t){return this._fetchIcon(t).pipe(Fl(e=>t.svgText=e),de$1(()=>this._svgElementFromConfig(t)))}_loadSvgIconSetFromConfig(t){return t.svgText?bg(null):this._fetchIcon(t).pipe(Fl(e=>t.svgText=e))}_extractSvgIconFromSet(t,e,n){let a=t.querySelector(`[id="${e}"]`);if(!a)return null;let o=a.cloneNode(!0);if(o.removeAttribute(`id`),o.nodeName.toLowerCase()===`svg`)return this._setSvgAttributes(o,n);if(o.nodeName.toLowerCase()===`symbol`)return this._setSvgAttributes(this._toSvgElement(o),n);let r=this._svgElementFromString(Mc(`<svg></svg>`));return r.appendChild(o),this._setSvgAttributes(r,n)}_svgElementFromString(t){let e=this._document.createElement(`DIV`);e.innerHTML=t;let n=e.querySelector(`svg`);if(!n)throw Error(`<svg> tag not found`);return n}_toSvgElement(t){let e=this._svgElementFromString(Mc(`<svg></svg>`)),n=t.attributes;for(let a=0;a<n.length;a++){let{name:o,value:r}=n[a];o!==`id`&&e.setAttribute(o,r)}for(let a=0;a<t.childNodes.length;a++)t.childNodes[a].nodeType===this._document.ELEMENT_NODE&&e.appendChild(t.childNodes[a].cloneNode(!0));return e}_setSvgAttributes(t,e){return t.setAttribute(`fit`,``),t.setAttribute(`height`,`100%`),t.setAttribute(`width`,`100%`),t.setAttribute(`preserveAspectRatio`,`xMidYMid meet`),t.setAttribute(`focusable`,`false`),e&&e.viewBox&&t.setAttribute(`viewBox`,e.viewBox),t}_fetchIcon(t){let{url:e,options:n}=t,a=n?.withCredentials??!1;if(!this._httpClient)throw Ie();if(e==null)throw Error(`Cannot fetch icon from URL "${e}".`);let o=this._sanitizer.sanitize(Us.RESOURCE_URL,e);if(!o)throw de(e);let r=this._inProgressUrlFetches.get(o);if(r)return r;let c=this._httpClient.get(o,{responseType:`text`,withCredentials:a}).pipe(de$1(d=>Mc(d)),Pl(()=>this._inProgressUrlFetches.delete(o)),os());return this._inProgressUrlFetches.set(o,c),c}_addSvgIconConfig(t,e,n){return this._svgIconConfigs.set(ue(t,e),n),this}_addSvgIconSetConfig(t,e){let n=this._iconSetConfigs.get(t);return n?n.push(e):this._iconSetConfigs.set(t,[e]),this}_svgElementFromConfig(t){if(!t.svgElement){let e=this._svgElementFromString(t.svgText);this._setSvgAttributes(e,t.options),t.svgElement=e}return t.svgElement}_getIconConfigFromResolvers(t,e){for(let n=0;n<this._resolvers.length;n++){let a=this._resolvers[n](e,t);if(a)return Le(a)?new x(a.url,null,a.options):new x(a,null)}}static ɵfac=function(e){return new(e||s)(Oe(Ro,8),Oe(Cr$1),Oe(pr,8),Oe(rt))};static ɵprov=X({token:s,factory:s.ɵfac,providedIn:`root`})}return s})();function bt(s){return s.cloneNode(!0)}function ue(s,i){return s+`:`+i}function Le(s){return!!(s.url&&s.options)}var De=[`*`];var ke=new S(`MAT_ICON_DEFAULT_OPTIONS`);var Me=new S(`mat-icon-location`,{providedIn:`root`,factory:()=>{let s=b(pr),i=s?s.location:null;return{getPathname:()=>i?i.pathname+i.search:``}}});var pe=[`clip-path`,`color-profile`,`src`,`cursor`,`fill`,`filter`,`marker`,`marker-start`,`marker-mid`,`marker-end`,`mask`,`stroke`];var Ae=pe.map(s=>`[${s}]`).join(`, `);var Re=/^url\(['"]?#(.*?)['"]?\)$/;var Tn=(()=>{class s{_elementRef=b(Ar);_iconRegistry=b(be);_location=b(Me);_errorHandler=b(rt);_defaultColor;get color(){return this._color||this._defaultColor}set color(t){this._color=t}_color;inline=!1;get svgIcon(){return this._svgIcon}set svgIcon(t){t!==this._svgIcon&&(t?this._updateSvgIcon(t):this._svgIcon&&this._clearSvgElement(),this._svgIcon=t)}_svgIcon;get fontSet(){return this._fontSet}set fontSet(t){let e=this._cleanupFontValue(t);e!==this._fontSet&&(this._fontSet=e,this._updateFontIconClasses())}_fontSet;get fontIcon(){return this._fontIcon}set fontIcon(t){let e=this._cleanupFontValue(t);e!==this._fontIcon&&(this._fontIcon=e,this._updateFontIconClasses())}_fontIcon;_previousFontSetClass=[];_previousFontIconClass;_svgName=null;_svgNamespace=null;_previousPath;_elementsWithExternalReferences;_currentIconFetch=Q.EMPTY;constructor(){let t=b(new zh(`aria-hidden`),{optional:!0}),e=b(ke,{optional:!0});e&&(e.color&&(this.color=this._defaultColor=e.color),e.fontSet&&(this.fontSet=e.fontSet)),t||this._elementRef.nativeElement.setAttribute(`aria-hidden`,`true`)}_splitIconName(t){if(!t)return[``,``];let e=t.split(`:`);switch(e.length){case 1:return[``,e[0]];case 2:return e;default:throw Error(`Invalid icon name: "${t}"`)}}ngOnInit(){this._updateFontIconClasses()}ngAfterViewChecked(){let t=this._elementsWithExternalReferences;if(t&&t.size){let e=this._location.getPathname();e!==this._previousPath&&(this._previousPath=e,this._prependPathToReferences(e))}}ngOnDestroy(){this._currentIconFetch.unsubscribe(),this._elementsWithExternalReferences&&this._elementsWithExternalReferences.clear()}_usingFontIcon(){return!this.svgIcon}_setSvgElement(t){this._clearSvgElement();let e=this._location.getPathname();this._previousPath=e,this._cacheChildrenWithExternalReferences(t),this._prependPathToReferences(e),this._elementRef.nativeElement.appendChild(t)}_clearSvgElement(){let t=this._elementRef.nativeElement,e=t.childNodes.length;for(this._elementsWithExternalReferences&&this._elementsWithExternalReferences.clear();e--;){let n=t.childNodes[e];(n.nodeType!==1||n.nodeName.toLowerCase()===`svg`)&&n.remove()}}_updateFontIconClasses(){if(!this._usingFontIcon())return;let t=this._elementRef.nativeElement,e=(this.fontSet?this._iconRegistry.classNameForFontAlias(this.fontSet).split(/ +/):this._iconRegistry.getDefaultFontSetClass()).filter(n=>n.length>0);this._previousFontSetClass.forEach(n=>t.classList.remove(n)),e.forEach(n=>t.classList.add(n)),this._previousFontSetClass=e,this.fontIcon!==this._previousFontIconClass&&!e.includes(`mat-ligature-font`)&&(this._previousFontIconClass&&t.classList.remove(this._previousFontIconClass),this.fontIcon&&t.classList.add(this.fontIcon),this._previousFontIconClass=this.fontIcon)}_cleanupFontValue(t){return typeof t==`string`?t.trim().split(` `)[0]:t}_prependPathToReferences(t){let e=this._elementsWithExternalReferences;e&&e.forEach((n,a)=>{n.forEach(o=>{a.setAttribute(o.name,`url('${t}#${o.value}')`)})})}_cacheChildrenWithExternalReferences(t){let e=t.querySelectorAll(Ae),n=this._elementsWithExternalReferences=this._elementsWithExternalReferences||new Map;for(let a=0;a<e.length;a++)pe.forEach(o=>{let r=e[a],c=r.getAttribute(o),d=c?c.match(Re):null;if(d){let g=n.get(r);g||(g=[],n.set(r,g)),g.push({name:o,value:d[1]})}})}_updateSvgIcon(t){if(this._svgNamespace=null,this._svgName=null,this._currentIconFetch.unsubscribe(),t){let[e,n]=this._splitIconName(t);e&&(this._svgNamespace=e),n&&(this._svgName=n),this._currentIconFetch=this._iconRegistry.getNamedSvgIcon(n,e).pipe(sn(1)).subscribe(a=>this._setSvgElement(a),a=>{let o=`Error retrieving icon ${e}:${n}! ${a.message}`;this._errorHandler.handleError(new Error(o))})}}static ɵfac=function(e){return new(e||s)};static ɵcmp=HE({type:s,selectors:[[`mat-icon`]],hostAttrs:[`role`,`img`,1,`mat-icon`,`notranslate`],hostVars:10,hostBindings:function(e,n){e&2&&(hh(`data-mat-icon-type`,n._usingFontIcon()?`font`:`svg`)(`data-mat-icon-name`,n._svgName||n.fontIcon)(`data-mat-icon-namespace`,n._svgNamespace||n.fontSet)(`fontIcon`,n._usingFontIcon()?n.fontIcon:null),yT(n.color?`mat-`+n.color:``),Oh(`mat-icon-inline`,n.inline)(`mat-icon-no-color`,n.color!==`primary`&&n.color!==`accent`&&n.color!==`warn`))},inputs:{color:`color`,inline:[2,`inline`,`inline`,N0],svgIcon:`svgIcon`,fontSet:`fontSet`,fontIcon:`fontIcon`},exportAs:[`matIcon`],ngContentSelectors:De,decls:1,vars:0,template:function(e,n){e&1&&(eT(),tT(0))},styles:[`mat-icon, mat-icon.mat-primary, mat-icon.mat-accent, mat-icon.mat-warn {
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
`],encapsulation:2})}return s})();var In=(()=>{class s{static ɵfac=function(e){return new(e||s)};static ɵmod=$E({type:s});static ɵinj=Xl({imports:[fi]})}return s})();Object.freeze([`drawLayer`,`drawRoute`,`measureLayer`,`cameraToolsLayer`,`analysisToolsLayer`]);var pt=class s{constructor(i,t,e){this.$viewerService=i;this.$mouseCoordsService=t;this.$deviceService=e;this._isMobile=this.$deviceService.checkMobile()}$viewerService;$mouseCoordsService;$deviceService;_viewer={};get viewer(){return this._viewer}_toolsServiceHasStarted=bn(!1);get toolsServiceHasStarted(){return this._toolsServiceHasStarted}_isMobile=!1;get isMobile(){return this._isMobile}drawingToolsLayerName=`drawLayer`;drawRouteLayerName=`drawRoute`;measuringToolsLayerName=`measureLayer`;cameraToolsLayerName=`cameraToolsLayer`;analysisToolsLayerName=`analysisToolsLayer`;async startToolsService(){try{this._viewer=this.$viewerService.viewer,await this._viewer?.dataSources.add(new N1(this.drawingToolsLayerName)),await this._viewer?.dataSources.add(new IR(this.drawRouteLayerName)),await this._viewer?.dataSources.add(new N1(this.measuringToolsLayerName)),await this._viewer?.dataSources.add(new N1(this.cameraToolsLayerName)),await this._viewer?.dataSources.add(new N1(this.analysisToolsLayerName)),this._toolsServiceHasStarted.set(!0)}catch(i){throw this._toolsServiceHasStarted()===!0&&this._toolsServiceHasStarted.set(!1),console.log(T5.red(`Ошибка старта ToolsService`)),i}}_activeTool=bn(void 0);get activeTool(){return this._activeTool}setActiveTool(i){this._activeTool.set(i)}_lastActiveTool=WT({source:this._activeTool,computation(i,t){return i!==void 0?i:t?.value}});get lastActiveTool(){return this._lastActiveTool}_drawingsBlocker=bn(!1);get drawingsBlocker(){return this._drawingsBlocker}setDrawingsBlocker(i){try{typeof i==`boolean`&&this._drawingsBlocker.set(i)}catch(t){throw t}}_commonHandler=bn(void 0);get commonHandler(){return this._commonHandler}createNewCommonHandler(i){try{return this._commonHandler.set(new Yg(this._viewer.scene.canvas)),this._commonHandler()._initializer=i,this._activeTool.set(i),!0}catch(t){throw t}}setCommonHandler(i,t,e){try{return this._commonHandler()?.setInputAction(i,t,e),!0}catch(n){throw n}}removeActionFromCommonHandler(i,t){try{return this._commonHandler()?.removeInputAction(i,t),!0}catch(e){throw e}}clearCommonHandler(){try{if(this._activeTool.set(void 0),this._commonHandler()!==void 0)if(this._commonHandler()instanceof Yg){if(this._commonHandler()?.destroy(),this._commonHandler()?.isDestroyed())return this._commonHandler.set(void 0),!0;throw new Error(`Error whith cleaning drawing _commonHandler`)}else return this._commonHandler.set(void 0),!0;else return!0}catch(i){throw i}finally{this.$viewerService.entityPickingBlock()&&this.$viewerService.offEntityPickingBlock(),this._drawingsBlocker()===!0&&this._drawingsBlocker.set(!1)}}eventSource=new K;cancelEvent$=this.eventSource.asObservable();triggerForCancelEvent(i){this.eventSource.next(i)}alertAboutToolError(i){try{this.triggerForCancelEvent(i),alert(`Отмена сценария по причине расчетной ошибки`)}catch(t){throw t}}_nowTerrainName=$T(()=>{try{let i={id:-1,name:``};return this.$viewerService?.viewer?.terrainProvider?.credit?.html||(i?.id!==-1?i?.name:void 0)}catch(i){console.log(T5.red(i));return}});get nowTerrainName(){return this._nowTerrainName}_isTerrain=$T(()=>{try{return!!this._nowTerrainName()}catch(i){return console.log(T5.red(i)),!1}});get isTerrain(){return this._isTerrain}setPointEntity(i,t={}){try{if(i===void 0)throw new Error(`Position arg is undefined in setPointEntity()`);let e=t?.id?t?.id:`${Math.ceil(Math.random()*1e6)}`;if(this._viewer.entities?.getById(e))throw new Error(`Entity already exist on draw layer in setPointEntity()`);let n=new Yi({id:e,name:t?.name?t?.name:t?.id?`${e}`:`point-${e}`,position:i,billboard:t?.billboard||void 0,label:t?.label?r({show:!0,text:t?.name?t?.name:t?.id?`${e}`:`point-${e}`,showBackground:!0,backgroundColor:new U(.165,.165,.165,.4),font:`14px sans-serif`,translucencyByDistance:new kt(3e6,1,5e6,0),style:ao.FILL,horizontalOrigin:Ei.CENTER,verticalOrigin:Nn.TOP,pixelOffset:new z(0,-60),disableDepthTestDistance:void 0,heightReference:We.CLAMP_TO_GROUND},t?.label):void 0,point:r({show:!1,pixelSize:4,color:U.WHITE,outline:!1,disableDepthTestDistance:void 0,heightReference:t?.clampToGround?We.CLAMP_TO_GROUND:We.NONE},t?.point),properties:t?.properties||void 0,show:t?.show!==void 0?t.show:!0});if(t?.clampToGround===void 0){let a=this.$viewerService?.clampToGroundSignal?.();n?.label&&t?.clampToGround===void 0&&(n.label.heightReference=a?new ci(We.CLAMP_TO_GROUND):new ci(We.NONE)),n?.billboard&&t?.clampToGround===void 0&&(n.billboard.heightReference=a?new ci(We.CLAMP_TO_GROUND):new ci(We.NONE)),a===!0&&this.setClampingToGroudForEntity(n)}return t?.clampToGround===!0&&this.setClampingToGroudForEntity(n),t.toolName&&(n.toolName=t.toolName),n}catch(e){console.log(this._activeTool()),this.alertAboutToolError(this._lastActiveTool()),console.log(T5.red(e));return}}setLineEntity(i,t,e,n={}){try{if(!i?.length)throw new Error(`Positions arg is undefined in setLineEntity()`);let a=n?.id?n?.id:`${Math.ceil(Math.random()*1e6)}`;if(this._viewer.entities?.getById(a))throw new Error(`Entity already exist on draw layer in setLineEntity()`);n?.clampToGround===void 0&&(n.clampToGround=this.$viewerService?.clampToGroundSignal?.());let o=new Yi({id:a,name:n?.name?n?.name:n?.id?`${a}`:`line-${a}`,position:t,label:r({text:e||(n?.name?n.name:n?.id?`${a}`:`line-${a}`),show:!0,showBackground:!0,font:n?.font?n?.font:`14px monospace`,horizontalOrigin:Ei.LEFT,verticalOrigin:Nn.BOTTOM,pixelOffset:new z(-20,-20),translucencyByDistance:new kt(3e6,1,5e6,0),style:ao.FILL,disableDepthTestDistance:void 0,heightReference:n?.clampToGround?We.CLAMP_TO_GROUND:We.NONE},n?.label),polyline:r({positions:i,width:n?.width?n?.width:3,material:n?.isMeasures===!0?new Ow({color:n?.color?n?.color:U.RED.withAlpha(1),gapColor:U.TRANSPARENT,dashLength:16,dashPattern:3855}):n?.material?n.material:n?.color?n?.color:n?.randomColor?U.fromHsl(Math.random(),1,.5,1):U.CHOCOLATE.withAlpha(1),clampToGround:n?.clampToGround},n?.polyline),properties:n?.properties||void 0});return n?.clampToGround===!0&&this.setClampingToGroudForEntity(o),n.toolName&&(o.toolName=n.toolName),o}catch(a){this.alertAboutToolError(this._lastActiveTool()),console.log(T5.red(a));return}}setPolygonEntity(i,t,e,n,a={}){try{if(!i?.length)throw new Error(`Positions arg is undefined in setLineEntity()`);let o=a?.id?a?.id:`${Math.ceil(Math.random()*1e6)}`;if(this._viewer.entities?.getById(o))throw new Error(`Entity already exist on draw layer in setPolygonEntity()`);a?.clampToGround===void 0&&(a.clampToGround=this.$viewerService?.clampToGroundSignal?.());let r$1=new Yi({id:o,name:a?.name?a?.name:a?.id?`${o}`:`polygon-${o}`,position:t,point:r({show:!1,pixelSize:4,color:U.WHITE,outline:!1,disableDepthTestDistance:void 0,heightReference:a?.clampToGround?We.CLAMP_TO_GROUND:We.NONE},a?.point),label:r({text:e||(a?.name?a.name:a?.id?`${o}`:`polygon-${o}`),show:!0,showBackground:!0,font:a?.font?a?.font:`14px sans-serif`,horizontalOrigin:Ei.LEFT,verticalOrigin:Nn.BOTTOM,pixelOffset:new z(-20,-40),translucencyByDistance:new kt(3e6,1,5e6,0),style:ao.FILL,disableDepthTestDistance:void 0,heightReference:a?.clampToGround?We.CLAMP_TO_GROUND:We.NONE},a?.label),polyline:r({positions:i,width:a?.width?a?.width:3,material:a?.isMeasures===!0?new Ow({color:a?.color?a?.color:U.RED.withAlpha(1),gapColor:U.TRANSPARENT,dashLength:16,dashPattern:3855}):a?.color?a?.color:a?.randomColor?U.fromHsl(Math.random(),1,.5,1):U.CHOCOLATE.withAlpha(1),clampToGround:a?.clampToGround},a?.polyline),polygon:a?.withoutPolygon?void 0:{material:a?.material?a?.material:U.WHITE.withAlpha(.3),perPositionHeight:!a.clampToGround,hierarchy:new dh(()=>n,!1)}});return a?.clampToGround===!0&&this.setClampingToGroudForEntity(r$1),a.toolName&&(r$1.toolName=a.toolName),r$1}catch(o){this.alertAboutToolError(this._lastActiveTool()),console.log(T5.red(o));return}}setEllipseEntity(i,t,e,n,a,o,r$2={}){try{if(!i?.length)throw new Error(`Positions arg is undefined in setEllipseEntity()`);let c=r$2?.id?r$2?.id:`${Math.ceil(Math.random()*1e6)}`;if(this._viewer.entities?.getById(c))throw new Error(`Entity already exist on draw layer in setEllipseEntity()`);r$2?.clampToGround===void 0&&(r$2.clampToGround=this.$viewerService?.clampToGroundSignal?.());let d=new Yi({id:c,name:r$2?.name?r$2?.name:r$2?.id?`${c}`:`ellipse-${c}`,position:t,point:r({show:!1,pixelSize:4,color:U.WHITE,outline:!1,disableDepthTestDistance:void 0,heightReference:r$2?.clampToGround?We.CLAMP_TO_GROUND:We.NONE},r$2?.point),label:r({text:e||(r$2?.name?r$2.name:r$2?.id?`${c}`:`ellipse-${c}`),show:!0,showBackground:!0,font:r$2?.font?r$2?.font:`14px sans-serif`,horizontalOrigin:Ei.LEFT,verticalOrigin:Nn.BOTTOM,pixelOffset:new z(-20,-40),translucencyByDistance:new kt(3e6,1,5e6,0),style:ao.FILL,disableDepthTestDistance:void 0,heightReference:r$2?.clampToGround?We.CLAMP_TO_GROUND:We.NONE},r$2?.label),polyline:r({positions:i,width:r$2?.width?r$2?.width:3,material:r$2?.isMeasures===!0?new Ow({color:r$2?.color?r$2?.color:U.RED.withAlpha(1),gapColor:U.TRANSPARENT,dashLength:16,dashPattern:3855}):r$2?.color?r$2?.color:r$2?.randomColor?U.fromHsl(Math.random(),1,.5,1):U.CHOCOLATE.withAlpha(1),clampToGround:r$2?.clampToGround},r$2?.polyline),polygon:r$2?.withoutPolygon?void 0:r$2?.polygon?r$2.polygon:void 0,ellipse:r({semiMinorAxis:a||0,semiMajorAxis:n||0,rotation:0,material:U.WHITE.withAlpha(.3),height:o||0,heightReference:r$2?.clampToGround?We.CLAMP_TO_GROUND:We.NONE,show:!0},r$2?.ellipse)});return r$2?.clampToGround===!0&&this.setClampingToGroudForEntity(d),r$2.toolName&&(d.toolName=r$2.toolName),d}catch(c){this.alertAboutToolError(this._lastActiveTool()),console.log(T5.red(c));return}}setEllipsoidEntity(i,t,e,n,a,o,r$3={}){try{if(!i?.length)throw new Error(`Positions arg is undefined in setEllipsoidEntity()`);let c=r$3?.id?r$3?.id:`${Math.ceil(Math.random()*1e6)}`;if(this._viewer.entities?.getById(c))throw new Error(`Entity already exist on draw layer in setEllipsoidEntity()`);let d=r$3?.color?r$3?.color:r$3?.randomColor?U.fromHsl(Math.random(),1,.5,1):U.BLUE.withAlpha(.3),g=U.BLACK.withAlpha(1),y;r$3?.arrow?y=new Dw(r$3?.auxiliaryColor?r$3?.auxiliaryColor:U.RED.withAlpha(1)):y=new Ow({color:r$3?.auxiliaryColor?r$3?.auxiliaryColor:U.RED.withAlpha(1),gapColor:U.TRANSPARENT,dashLength:16,dashPattern:3855});let U$1=r$3?.auxiliaryColor?r$3?.auxiliaryColor:U.RED.withAlpha(1),wt=new Yi({id:c,name:r$3?.name?r$3?.name:r$3?.id?`${c}`:`ellipsoid-${c}`,position:t,point:r$3.withPoint?r({pixelSize:4,color:U.WHITE.withAlpha(1),outline:!0,outlineColor:r$3.auxiliaryColor?r$3?.auxiliaryColor:U.RED.withAlpha(1),outlineWidth:2,disableDepthTestDistance:Number.POSITIVE_INFINITY,heightReference:We.NONE},r$3?.point):void 0,label:r({text:e||(r$3?.name?r$3.name:r$3?.id?`${c}`:`ellipsoid-${c}`),show:!0,showBackground:!0,font:r$3?.font?r$3?.font:`14px monospace`,horizontalOrigin:Ei.LEFT,verticalOrigin:Nn.BOTTOM,pixelOffset:new z(20,0),translucencyByDistance:new kt(3e6,1,5e6,0),style:ao.FILL,disableDepthTestDistance:Number.POSITIVE_INFINITY,heightReference:We.NONE},r$3?.label),polyline:r$3.withPoint?r({positions:i,width:r$3?.width?r$3?.width:3,material:y,clampToGround:!1,show:!0},r$3?.polyline):void 0,ellipse:r$3.withPoint?r({semiMinorAxis:a,semiMajorAxis:a,rotation:0,material:U.WHITE.withAlpha(.3),outline:!0,outlineColor:U$1,outlineWidth:r$3?.width?r$3?.width:3,height:o||0,heightReference:We.NONE,show:!0},r$3?.ellipse):void 0,ellipsoid:r({radii:n,minimumCone:r$3?.minimumCone?r$3?.minimumCone:P.toRadians(0),maximumCone:r$3?.maximumCone?r$3?.maximumCone:P.toRadians(90),material:d,outline:!0,outlineColor:g,outlineWidth:r$3?.width?r$3?.width:1,heightReference:We.NONE,show:!0},r$3?.ellipsoid)});return r$3.toolName&&(wt.toolName=r$3.toolName),wt}catch(c){this.alertAboutToolError(this._lastActiveTool()),console.log(T5.red(c));return}}changeEntityName(i,t,e,n){try{let a=this.findEntityPathInStore(t,e);if(a.indexGroup===void 0||a.indexEntity===void 0)throw new Error(`Entity's path search error in changeEntityName fn`);if(e()[a.indexGroup]?.entitiesList[a.indexEntity]?.name)e.update(o=>(o[a.indexGroup].entitiesList[a.indexEntity].name=i.trim(),[...o]));else throw new Error(`Invalid path to entity's name in changeEntityName fn`);return n!==void 0&&typeof n==`string`&&e()[a.indexGroup]?.entitiesList[a.indexEntity]?.label&&(e()[a.indexGroup].entitiesList[a.indexEntity].label.text=new ci(n.trim())),!0}catch(a){return console.log(T5.red(a)),!1}}changeEntityColor(i,t,e){try{let n=this.findEntityPathInStore(t,e);if(n.indexGroup===void 0||n.indexEntity===void 0)throw new Error(`Entity's path search error in changeEntityName fn`);return e()?.[n.indexGroup]?.entitiesList?.[n.indexEntity]?.polyline?.material?(e()[n.indexGroup].entitiesList[n.indexEntity].polyline.material=new Ht(U.fromCssColorString(i)),!0):!1}catch(n){return console.log(T5.red(n)),!1}}findEntityPathInStore(i,t){try{if(i.split(`-`).length<2)throw new Error(`Invalid id (none groupId) in findEntityPathInStore fn`);let e=i.split(`-`)[0];if(!t().length)throw new Error(`Store is empty in findEntityPathInStore fn`);let n=t().findIndex(r=>r?.groupId===e);if(n===-1)return{indexGroup:void 0,indexEntity:void 0};let a=t()[n];if(!a?.entitiesList.length)return T5.blue(`Entity collection in group is empty in findEntityPathInStore fn. Array may be already cleared.`),{indexGroup:void 0,indexEntity:void 0};let o=a.entitiesList.findIndex(r=>r.id===i);return n===-1?{indexGroup:void 0,indexEntity:void 0}:{indexGroup:n,indexEntity:o}}catch(e){return console.log(T5.red(e)),{indexGroup:void 0,indexEntity:void 0}}}switchClampingToGroudForOneStoreEntities(i,t){try{if(console.log(`Switching clamping to groud for entities in store: "${i.name}"`),!i().length)return!1;let e=0,n=0;for(let a of i())if(a?.entitiesList.length){n=n+a.entitiesList.length;for(let o of a.entitiesList)o instanceof Yi&&this.switchClampingToGroudForEntity(o,t)&&e++}return e===n}catch(e){return console.log(T5.red(e)),!1}}switchClampingToGroudForTemporalEntities(i,t,e){try{if(!i().length)return!1;let n=0,a=0;for(let o of i())if(o instanceof Yi)if(e?.length){let r=!1;for(let c of e)o?.id?.includes(c)===!0&&(r=!0,a++);r||this.switchClampingToGroudForEntity(o,t)&&n++}else this.switchClampingToGroudForEntity(o,t)&&n++;return n===i().length-a}catch(n){return console.log(T5.red(n)),!1}}setClampingToGroudForEntity(i){try{let t=!0;return(this.$viewerService.viewer.scene.mode===1||this.$viewerService.viewer.scene.mode===2)&&(t=!1),this.switchClampingToGroudForEntity(i,t)}catch(t){return console.log(T5.red(t)),!1}}switchClampingToGroudForEntity(i,t){try{return i?.point&&(t?i.point.heightReference=new ci(We.CLAMP_TO_GROUND):i.point.heightReference=new ci(We.NONE),t?i.point.disableDepthTestDistance=void 0:i.point.disableDepthTestDistance=new ci(Number.POSITIVE_INFINITY)),i?.label&&(t?i.label.heightReference=new ci(We.CLAMP_TO_GROUND):i.label.heightReference=new ci(We.NONE),t?i.label.disableDepthTestDistance=void 0:i.label.disableDepthTestDistance=new ci(Number.POSITIVE_INFINITY)),i?.billboard&&(t?i.billboard.heightReference=new ci(We.CLAMP_TO_GROUND):i.billboard.heightReference=new ci(We.NONE),t?i.billboard.disableDepthTestDistance=void 0:i.billboard.disableDepthTestDistance=new ci(Number.POSITIVE_INFINITY)),i?.polyline&&(i.polyline.clampToGround=new ci(t)),i?.polygon?.perPositionHeight&&(i.polygon.perPositionHeight=new ci(!t)),i?.ellipse&&(t?i.ellipse.heightReference=new ci(We.CLAMP_TO_GROUND):i.ellipse.heightReference=new ci(We.NONE)),!0}catch(e){return console.log(T5.red(e)),!1}}setEntityConstantsTimer=18e4;setConstantsForStoreEntities(i,t){try{let e=t;if(!e||typeof e!=`string`)throw new Error(`Invalid entity's ID in setConstantsForStoreEntities fn`);if(!i().length)return!1;let n=this.findEntityPathInStore(e,i);if(n.indexGroup===void 0||n.indexEntity===void 0)return!1;let a=i()?.[n.indexGroup]?.entitiesList?.[n.indexEntity];if(!a||!(a instanceof Yi))throw new Error(`Invalid entity in setConstantsForStoreEntities fn`);if(console.log(T5.blue(`Auto rerender for:`,t)),a?.position&&a.position.constructor?.name===`CallbackPositionProperty`){let o=a.position?.getValue();o&&o instanceof d&&(a.position=new Sl(o))}else if(a?.position&&a.position.constructor?.name===`CallbackProperty`){let o=a.position?.getValue();o&&o instanceof d&&(a.position=new Sl(o))}if(a?.label?.text&&a.label.text.constructor?.name===`CallbackProperty`){let o=a.label.text?.getValue();o!==void 0&&(a.label.text=new ci(o))}if(a?.billboard?.color&&a.billboard.color.constructor?.name===`CallbackProperty`){let o=a.billboard.color?.getValue();o&&o instanceof U&&(a.billboard.color=new ci(new U(o.red,o.green,o.blue,o.alpha??1)))}if(a?.polyline){if(a?.polyline.positions&&a.polyline.positions.constructor?.name===`CallbackProperty`){let o=a.polyline.positions?.getValue();o?.length&&o?.[0]instanceof d&&(a.polyline.positions=new ci(o))}if(a?.polyline.material&&a.polyline.material.constructor?.name===`CallbackProperty`){let o=a.polyline.material?.getValue();o&&(a.polyline.material=o)}}if(a?.polygon?.material&&a.polygon.material.constructor?.name===`CallbackProperty`){let o=a.polygon.material?.getValue();o&&(a.polygon.material=o)}if(a?.ellipse){if(a.ellipse?.semiMinorAxis&&a.ellipse.semiMinorAxis.constructor?.name===`CallbackProperty`){let o=a.ellipse.semiMinorAxis?.getValue();o!==void 0&&(a.ellipse.semiMinorAxis=new ci(o))}if(a.ellipse?.semiMajorAxis&&a.ellipse.semiMajorAxis.constructor?.name===`CallbackProperty`){let o=a.ellipse.semiMajorAxis?.getValue();o!==void 0&&(a.ellipse.semiMajorAxis=new ci(o))}}if(a?.ellipsoid){if(a.ellipsoid?.radii&&a.ellipsoid.radii.constructor?.name===`CallbackProperty`){let o=a.ellipsoid.radii?.getValue();o&&o instanceof d&&(a.ellipsoid.radii=new ci(o))}if(a.ellipsoid?.material&&a.ellipsoid.material.constructor?.name===`CallbackProperty`){let o=a.ellipsoid.material?.getValue();o&&(a.ellipsoid.material=o)}if(a.ellipsoid?.maximumCone&&a.ellipsoid.maximumCone.constructor?.name===`CallbackProperty`){let o=a.ellipsoid.maximumCone?.getValue();o!==void 0&&(a.ellipsoid.maximumCone=new ci(o))}if(a.ellipsoid?.minimumCone&&a.ellipsoid.minimumCone.constructor?.name===`CallbackProperty`){let o=a.ellipsoid.minimumCone?.getValue();o!==void 0&&(a.ellipsoid.minimumCone=new ci(o))}}return!0}catch(e){return console.log(T5.red(e)),!1}}async getMouseEntity(i=!0){return await this.$mouseCoordsService.getMouseEntity(i)}async getDetailedPosition(i){try{if(i===void 0||!(i instanceof d))throw new Error(`Invalid position data`);let t=fe$1.fromCartesian(i),e=await this.$viewerService.getHeight(t);if(e&&t.height!==e){let n=new fe$1(t.longitude,t.latitude,e);return fe$1.toCartesian(n)}else return i}catch(t){return console.log(T5.red(`Detailed position calculation failed`)),console.log(t),i}}async getPositionCoordsDescription(i,t=this.$mouseCoordsService.selectedCrs(),e){try{if(i===void 0)return{latitudeDescription:`нет данных`,longitudeDescription:`нет данных`,heightDescription:`нет данных`,coordsDescription:`нет данных`};let n=this.$viewerService.viewer.scene.globe.ellipsoid.cartesianToCartographic(i),a=P.toDegrees(n.longitude),o=P.toDegrees(n.latitude),r=0;e?r=e:r=await this.$viewerService.getHeight(n);let c=Us$1.fromWGS84Cartographic(t,{latitude:o,longitude:a,height:r},``),d=``,g=``,y=``,U=``;return t===`СК-42 м`?(d=`X: ${c.latitude.toFixed(1)} \u043C`,g=`Y: ${c.longitude.toFixed(1)} \u043C`,y=`H: ${c.height.toFixed(1)} \u043C`,U=`${d}
${g}
${y}`):(d=`B: ${c.latitude.toFixed(7)} \u02DA`,g=`L: ${c.longitude.toFixed(7)} \u02DA`,y=`H: ${c.height.toFixed(1)} \u043C`,U=`${d}
${g}
${y}`),{latitudeDescription:d,longitudeDescription:g,heightDescription:y,coordsDescription:U}}catch(n){console.log(T5.red(n));return}}async getPositionCoordsNumbers(i,t=this.$mouseCoordsService.selectedCrs(),e){try{if(i===void 0)return{latitude:`нет данных`,longitude:`нет данных`,height:`нет данных`,crs:`нет данных`};let n=this.$viewerService.viewer.scene.globe.ellipsoid.cartesianToCartographic(i),a=P.toDegrees(n.longitude),o=P.toDegrees(n.latitude),r=0;e?r=e:r=await this.$viewerService.getHeight(n);let c=Us$1.fromWGS84Cartographic(t,{latitude:o,longitude:a,height:r},``),d=``,g=``,y=``;return t===`СК-42 м`?(d=c.latitude.toFixed(1),g=c.longitude.toFixed(1),y=c.height.toFixed(1)):(d=c.latitude.toFixed(7),g=c.longitude.toFixed(7),y=c.height.toFixed(1)),{latitude:d,longitude:g,height:y,crs:t}}catch(n){console.log(T5.red(n));return}}static ɵfac=function(t){return new(t||s)(Oe(xIe),Oe(Ml),Oe(n))};static ɵprov=X({token:s,factory:s.ɵfac})};function zn(s){if(!s?.ellipse)throw new Error(`Entity ellipse is undefined in getCircle()`);if(!s?.position?.getValue()||!s.ellipse?.semiMajorAxis||!s.ellipse?.semiMinorAxis)throw new Error(`Entity is not valid in getCircle()`);let i=s?.ellipse,t=s?.position?.getValue(),e=i?.semiMajorAxis?.getValue(),n=i?.semiMinorAxis?.getValue(),a=i?.rotation?.getValue(),o=new Z1({center:t||d.ZERO,semiMajorAxis:e||0,semiMinorAxis:n||0,rotation:a||0,granularity:Math.PI/360}),r=Z1.createGeometry(o);if(!r)return[];let c=[];if(!r.attributes.position)throw new Error(`Ellipse geometry creation failure in getCircle()`);for(let d$1=0;d$1<r.attributes.position.values.length;d$1+=3)c.push(new d(r.attributes.position.values[d$1],r.attributes.position.values[d$1+1],r.attributes.position.values[d$1+2]));return c.push(c[0]),c}function $n(s,i){let t=fe$1.fromCartesian(s),e=fe$1.fromCartesian(i);return[d.fromRadians(t.longitude,t.latitude),d.fromRadians(t.longitude,e.latitude),d.fromRadians(e.longitude,e.latitude),d.fromRadians(e.longitude,t.latitude),d.fromRadians(t.longitude,t.latitude)]}var fe=Object.freeze([`addMark`,`addLine`,`addRectangle`,`addCircle`,`addPolygon`]);function _(s){switch(s){case`addMark`:return`Метка`;case`addLine`:return`Линия`;case`addRectangle`:return`Прямоугольник`;case`addCircle`:return`Окружность`;case`addPolygon`:return`Многоугольник`;default:return s}}Object.freeze([_(`addMark`),_(`addLine`),_(`addRectangle`),_(`addCircle`),_(`addPolygon`)]);function Yn(s){switch(s){case _(`addMark`):return`addMark`;case _(`addLine`):return`addLine`;case _(`addRectangle`):return`addRectangle`;case _(`addCircle`):return`addCircle`;case _(`addPolygon`):return`addPolygon`;default:return s}}var he=class s{constructor(i,t){this.$viewerService=i;this.$toolsService=t;this.findEntityPathInStore=this.$toolsService.findEntityPathInStore,this.drawingToolsLayerName=this.$toolsService.drawingToolsLayerName,this.drawRouteLayerName=this.$toolsService.drawRouteLayerName,zu(()=>{try{let e=!0;this.$viewerService.nowSceneModeDescription()===`2D`||this.$viewerService.nowSceneModeDescription()===`Columbus`?e=!1:e=!0,Gh(()=>{this._temporalEntitiesList()?.length&&this.$toolsService.switchClampingToGroudForTemporalEntities(this._temporalEntitiesList,e,[`vectorPolygons`,`addAnnotation`,`addPhoto`,`addDome`,`heatmap`]),this._addMarkEntitiesList()?.length&&this.$toolsService.switchClampingToGroudForOneStoreEntities(this._addMarkEntitiesList,e),this._addLineEntitiesList()?.length&&this.$toolsService.switchClampingToGroudForOneStoreEntities(this._addLineEntitiesList,e),this._addRectangleEntitiesList()?.length&&this.$toolsService.switchClampingToGroudForOneStoreEntities(this._addRectangleEntitiesList,e),this._addCircleEntitiesList()?.length&&this.$toolsService.switchClampingToGroudForOneStoreEntities(this._addCircleEntitiesList,e),this._addPolygonEntitiesList()?.length&&this.$toolsService.switchClampingToGroudForOneStoreEntities(this._addPolygonEntitiesList,e),this._routeEntityList()?.length&&this.$toolsService.switchClampingToGroudForOneStoreEntities(this._routeEntityList,e)})}catch(e){console.log(T5.red(e))}})}$viewerService;$toolsService;cancelDrawingTool(){try{this.removeTemporalEntities(),this.$toolsService.clearCommonHandler()}catch(i){throw i}}_addMarkEntitiesList=bn([]);get addMarkEntitiesList(){return this._addMarkEntitiesList}isMarks=$T(()=>!!this._addMarkEntitiesList().length);_addLineEntitiesList=bn([]);get addLineEntitiesList(){return this._addLineEntitiesList}isLines=$T(()=>!!this._addLineEntitiesList().length);_addRectangleEntitiesList=bn([]);get addRectangleEntitiesList(){return this._addRectangleEntitiesList}isRectangles=$T(()=>!!this._addRectangleEntitiesList().length);_addCircleEntitiesList=bn([]);get addCircleEntitiesList(){return this._addCircleEntitiesList}isCircles=$T(()=>!!this._addCircleEntitiesList().length);_addPolygonEntitiesList=bn([]);get addPolygonEntitiesList(){return this._addPolygonEntitiesList}isPoligons=$T(()=>!!this._addPolygonEntitiesList().length);_vectorPolygonsList=bn([]);get vectorPolygonsList(){return this._vectorPolygonsList}isVectorPolygons=$T(()=>!!this._vectorPolygonsList().length);_annotationsList=bn([]);get annotationsList(){return this._annotationsList}isAnnotations=$T(()=>!!this._annotationsList().length);_photosList=bn([]);get photosList(){return this._photosList}isPhotos=$T(()=>!!this._photosList().length);_addDomeEntitiesList=bn([]);get addDomeEntitiesList(){return this._addDomeEntitiesList}isDomes=$T(()=>!!this._addDomeEntitiesList().length);_heatmapList=bn([]);get heatmapList(){return this._heatmapList}isHeatmap=$T(()=>!!this._addDomeEntitiesList().length);_routeEntityList=bn([]);get routeEntityList(){return this._routeEntityList}isRoutes=$T(()=>!!this._routeEntityList().length);_allEntitiesListsLinks={addMark:this._addMarkEntitiesList,addLine:this._addLineEntitiesList,addRectangle:this._addRectangleEntitiesList,addCircle:this._addCircleEntitiesList,addPolygon:this._addPolygonEntitiesList};get allEntitiesListsLinks(){return this._allEntitiesListsLinks}_overEntitiesList=bn([]);get overEntitiesList(){return this._overEntitiesList}isOver=$T(()=>!!this._overEntitiesList().length);_temporalEntitiesList=bn([]);get temporalEntitiesList(){return this._temporalEntitiesList}removeEntitiesByGroupId(i,t,e=this.drawingToolsLayerName){try{if(!t().length)return!1;if(i===void 0)return console.log(T5.blue(`Entities group to delete is not defined (by removeEntitiesByGroupId fn)`)),!1;let n=[],a=t().findIndex(r=>r?.groupId.startsWith(i));if(a!==-1&&t()[a]?.entitiesList){for(let r of t()[a].entitiesList)n.push(r.id);t.update(r=>(r.splice(a,1),[...r]))}else return console.log(T5.blue(`Entities group to delete haven't found in entitiesStore (by removeEntitiesByGroupId fn)`)),!1;let o=this?.$viewerService.viewer.dataSources?.getByName(`${e}`)?.[0];if(o)for(let r of n)o.entities.removeById(r);else return console.log(T5.blue(`dataSource is undefined (by removeEntitiesByGroupId fn)`)),!1;return!0}catch(n){return console.log(T5.red(n)),!1}}removeOneEntityByGroupId(i,t,e=this.drawingToolsLayerName){try{if(!t().length)return!1;let n=t().findIndex(o=>o?.groupId.startsWith(i));if(n!==-1&&t()[n]?.entitiesList)t.update(o=>(o.splice(n,1),[...o]));else return console.log(T5.blue(`Entity Id hasn't found in entitiesStore (by removeOneEntityByGroupId fn)`)),!1;let a=this?.$viewerService.viewer.dataSources?.getByName(`${e}`)?.[0];return a?a.entities.removeById(i):(console.log(T5.blue(`dataSource is undefined (by removeOneEntityByGroupId fn)`)),!1)}catch(n){return console.log(T5.red(n)),!1}}allToolEntitiesCleaning(i,t=this.drawingToolsLayerName){try{if(!i)throw new Error(`toolName is undefined in allToolEntitiesCleaning fn`);if(!fe.includes(i))return!0;if(!this._allEntitiesListsLinks[i])throw new Error(`targetStore is undefined in allToolEntitiesCleaning fn`);let e=this._allEntitiesListsLinks[i];if(!e().length)return console.log(T5.blue(`targetStore is already empty (by allToolEntitiesCleaning fn)`)),console.trace(),!1;let n=[];for(let o of e())if(o?.entitiesList.length)for(let r of o.entitiesList)n.push(r.id);if(n.length)e.update(()=>[]);else return console.log(T5.blue(`Nothing to erase in targetStore (by allToolEntitiesCleaning fn)`)),!1;let a=this?.$viewerService.viewer.dataSources?.getByName(`${t}`)?.[0];if(a)for(let o of n)a.entities.removeById(o);else return console.log(T5.blue(`dataSource is undefined (by allToolEntitiesCleaning fn)`)),!1;return!0}catch(e){return console.log(T5.red(e)),!1}}allOversEntitiesCleaning(i=this.drawingToolsLayerName){try{let t=this._overEntitiesList;if(!t().length)return console.log(T5.blue(`targetStore is already empty (by allOversEntitiesCleaning fn)`)),!1;let e=[];for(let a of t())if(a?.entitiesList.length)for(let o of a.entitiesList)e.push(o.id);if(e.length)t.update(()=>[]);else return console.log(T5.blue(`Nothing to erase in targetStore (by allOversEntitiesCleaning fn)`)),!1;let n=this?.$viewerService.viewer.dataSources?.getByName(`${i}`)?.[0];if(n)for(let a of e)n.entities.removeById(a);else return console.log(T5.blue(`dataSource is undefined (by allOversEntitiesCleaning fn)`)),!1;return!0}catch(t){return console.log(T5.red(t)),!1}}clearDrawingsDataSource(){try{let i=this?.$viewerService.viewer.dataSources?.getByName(this.drawingToolsLayerName)?.[0];if(i)i.entities.removeAll();else return console.log(T5.blue(`dataSource is undefined (by clearDrawingsDataSource fn)`)),!1;return Object.values(this._allEntitiesListsLinks).concat(this._overEntitiesList).forEach(e=>{e!==this._routeEntityList&&e.update(()=>[])}),!0}catch(i){return console.log(T5.red(i)),!1}}clearRouteDataSources(){try{let i=this?.$viewerService.viewer.dataSources?.getByName(`drawRoute`)?.[0];if(i)i.entities.removeAll();else return console.log(T5.blue(`dataSource is undefined (by clearRouteDataSources fn)`)),!1;return this._routeEntityList.update(()=>[]),!0}catch(i){return console.log(T5.red(i)),!1}}changeDefaultEntityInGroup(i,t,e){try{let n=e?this._allEntitiesListsLinks[e]:this._overEntitiesList,a=n().findIndex(o=>o?.groupId===i);if(a!==-1)n.update(o=>(o[a].defaultEntity=t||void 0,[...o]));else return console.log(T5.blue(`groupId hasn't found in changeDefaultEntityInGroup fn`)),!1;return!0}catch(n){return console.log(T5.red(n)),!1}}pushGroupFromTemporal(i,t,e){try{let n=t?this._allEntitiesListsLinks[t]:this._overEntitiesList,a=n().findIndex(o=>o?.groupId===i);return a===-1?n.update(o=>(o.push({groupId:i,entitiesList:this._temporalEntitiesList(),defaultEntity:e||void 0}),[...o])):n.update(o=>(o[a]?.entitiesList.push(...this._temporalEntitiesList()),[...o])),!0}catch(n){return console.log(T5.red(n)),!1}}pushGroupWithoutTemporal(i,t,e,n){try{if(!i.length)throw new Error(`None entities in pushGroupWithoutTemporal fn`);let a=e?this._allEntitiesListsLinks[e]:this._overEntitiesList,o=a().findIndex(r=>r?.groupId===t);return o===-1?a.update(r=>(r.push({groupId:t,entitiesList:i,defaultEntity:n||void 0}),[...r])):a.update(r=>(r[o]?.entitiesList.push(...i),[...r])),!0}catch(a){return console.log(T5.red(a)),!1}}pushGroupWithoutTemporalWithDrawing(i,t,e,n){try{if(!i||!i?.length)throw new Error(`None entities in pushGroupWithoutTemporal fn`);let a=[],o;if(o=this.$viewerService.viewer.dataSources?.getByName(this.drawingToolsLayerName)?.[0],o!==void 0)for(let r of i){if(!r?.id)continue;if(o.entities.values.findIndex(d=>d.id===r.id)!==-1){console.log(T5.blue(`Entity already exists on draw layer and will be loose (in pushGroupWithoutTemporalWithDrawing fn)`));continue}a.push(r)}else a=i;if(!a.length)return console.log(T5.blue(`No valid entities on pushing "${e}" entities in store (in pushGroupWithoutTemporalWithDrawing fn)`)),!1;if(this.pushGroupWithoutTemporal(a,t,e,n)===!0){for(let r of a)this.addNewEntityToDrawLayer(r);return!0}else return!1}catch(a){return console.log(T5.red(a)),!1}}clearTemporalEntitiesList(i){try{return this._temporalEntitiesList().length?i?this._temporalEntitiesList.update(t=>(t=t.filter(e=>!e?.id.startsWith(i)),[...t])):this._temporalEntitiesList.set([]):console.log(`_temporalEntitiesList() is empty in clearTemporalEntitiesList fn`),!0}catch(t){return console.log(T5.red(t)),!1}}removeTemporalEntities(i,t=this.drawingToolsLayerName){try{if(!this._temporalEntitiesList().length)return!1;let e=[];if(i)for(let a of this._temporalEntitiesList())a?.id.startsWith(i)&&e.push(a.id);else for(let a of this._temporalEntitiesList())e.push(a.id);if(this.clearTemporalEntitiesList(i)){let a=this?.$viewerService.viewer.dataSources?.getByName(`${t}`)?.[0];if(a){for(let o of e)a.entities.removeById(o);return!0}else return console.log(T5.blue(`dataSource is undefined (by removeTemporalEntities fn)`)),!1}else return console.log(T5.blue(`Temporal store clearing has failed (by removeTemporalEntities fn)`)),!1}catch(e){return console.log(T5.red(e)),!1}}addNewEntityToDrawLayer(i){try{let t=this?.$viewerService.viewer.dataSources?.getByName(this.drawingToolsLayerName)?.[0];return t?(t.entities.add(i),!0):(console.log(T5.red(`Data source hasn't found in addNewEntityToDrawLayer fn`)),!1)}catch(t){throw t}}addNewEntityToDrawRoute(i){try{if(!i||!(i instanceof Yi))return console.log(T5.red(`Invalid entity in addNewEntityToDrawRoute fn`)),!1;let t=this?.$viewerService.viewer.dataSources?.getByName(this.$toolsService.drawRouteLayerName)?.[0];return t?(t.entities.add(i),!0):(console.log(T5.red(`Data source hasn't found in addNewEntityToDrawRoute fn`)),!1)}catch(t){throw t}}setEntityConstantsTimeouts={};setEntityConstants(i){try{let t=i;if(!t||typeof t!=`string`)throw new Error(`Invalid entity's ID in setEntityConstants fn`);this.setEntityConstantsTimeouts?.[t]&&clearTimeout(this.setEntityConstantsTimeouts[t]);let e=t.split(`-`)[1];if(fe.includes(e))this.setEntityConstantsTimeouts[t]=setTimeout(n=>{this.$toolsService.setConstantsForStoreEntities(this.allEntitiesListsLinks[e],n)},this.$toolsService.setEntityConstantsTimer,t);else throw new Error(`Invalid entity's tool's name in setEntityConstants fn`)}catch(t){throw t}}static ɵfac=function(t){return new(t||s)(Oe(xIe),Oe(pt))};static ɵprov=X({token:s,factory:s.ɵfac})};export{_ as a,on as c,we as d,zn as f,Yn as i,pt as l,In as n,fe as o,Tn as r,he as s,$n as t,rn as u};