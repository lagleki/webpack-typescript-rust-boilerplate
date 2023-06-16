var camxes="use strict";function peg$subclass(t,r){function e(){this.constructor=t}e.prototype=r.prototype,t.prototype=new e}function peg$SyntaxError(t,r,e,n){var o=Error.call(this,t);return Object.setPrototypeOf&&Object.setPrototypeOf(o,peg$SyntaxError.prototype),o.expected=r,o.found=e,o.location=n,o.name="SyntaxError",o}function peg$padEnd(t,r,e){return e=e||" ",t.length>r?t:(r-=t.length,t+(e+=e.repeat(r)).slice(0,r))}function peg$parse(t,r){var e,n={},o=(r=void 0!==r?r:{}).grammarSource,u={text:ft},s=ft,i=/^[a]/,l=/^[aeo]/,a=/^[aeiou]/,c=/^[i]/,f=/^[u]/,v=/^[y]/,x=/^[i\u0269]/,P=/^[uw]/,d=/^[l]/,h=/^[m]/,p=/^[n]/,g=/^[r]/,A=/^[pfbgvkx]/,y=/^[d]/,m=/^[jz]/,E=/^[cs]/,$=/^[x]/,S=/^[t]/,b=/^[,']/,w=/^[}]/,F=/^[^a-za-z,']/,j=st(["a"],!1,!1),z=st(["a","e","o"],!1,!1),C=st(["a","e","i","o","u"],!1,!1),O=st(["i"],!1,!1),R=st(["u"],!1,!1),k=st(["y"],!1,!1),M=st(["i","ɩ"],!1,!1),U=st(["u","w"],!1,!1),q=st(["l"],!1,!1),B=st(["m"],!1,!1),D=st(["n"],!1,!1),G=st(["r"],!1,!1),H=st(["p","f","b","g","v","k","x"],!1,!1),I=st(["d"],!1,!1),J=st(["j","z"],!1,!1),K=st(["c","s"],!1,!1),L=st(["x"],!1,!1),N=st(["t"],!1,!1),Q=st([",","'"],!1,!1),T=st(["}"],!1,!1),V={type:"any"},W=st([["a","z"],["a","z"],",","'"],!0,!1),X=(st([" "],!0,!1),function(t){return yr(t)}),Y=function(t,r,e){return[Ar(t),"-",Ar(r),Ar(e)]},Z=function(t){return[Ar(t),"-"]},_=function(t,r){return[Ar(t),"-",Ar(r)]},tt=0,rt=[{line:1,column:1}],et=0,nt=[],ot=0,ut={};if("startRule"in r){if(!(r.startRule in u))throw new Error("Can't start parsing from rule \""+r.startRule+'".');s=u[r.startRule]}function st(t,r,e){return{type:"class",parts:t,inverted:r,ignoreCase:e}}function it(r){var e,n=rt[r];if(n)return n;for(e=r-1;!rt[e];)e--;for(n={line:(n=rt[e]).line,column:n.column};e<r;)10===t.charCodeAt(e)?(n.line++,n.column=1):n.column++,e++;return rt[r]=n,n}function lt(t,r){var e=it(t),n=it(r);return{source:o,start:{offset:t,line:e.line,column:e.column},end:{offset:r,line:n.line,column:n.column}}}function at(t){tt<et||(tt>et&&(et=tt,nt=[]),nt.push(t))}function ct(t,r,e){return new peg$SyntaxError(peg$SyntaxError.buildMessage(t,r),t,r,e)}function ft(){var t,r,e,o=67*tt+0,u=ut[o];if(u)return tt=u.nextPos,u.result;for(t=tt,r=[],e=vt();e!==n;)r.push(e),e=vt();return t,t=r=X(r),ut[o]={nextPos:tt,result:t},t}function vt(){var t,r,e=67*tt+1,o=ut[e];return o?(tt=o.nextPos,o.result):(t=tt,(r=xt())!==n&&(t,r=r),t=r,ut[e]={nextPos:tt,result:t},t)}function xt(){var t,r,e,o,u,s,i,l,a,c,f,v=67*tt+2,x=ut[v];return x?(tt=x.nextPos,x.result):((t=gr())===n&&(t=Pt())===n&&(t=tt,(r=yt())!==n&&(t,r=["cmavo",Ar(r)]),(t=r)===n&&(t=tt,(r=dt())!==n&&(t,r=function(t){return["gismu",Ar(t)]}(r)),(t=r)===n&&(t=tt,r=tt,e=tt,ot++,o=dt(),ot--,o===n?e=void 0:(tt=e,e=n),e!==n?(o=tt,ot++,u=At(),ot--,u===n?o=void 0:(tt=o,o=n),o!==n?(u=tt,ot++,s=yt(),ot--,s===n?u=void 0:(tt=u,u=n),u!==n?(s=tt,ot++,i=tt,(l=Mt())!==n&&(a=dr())!==n&&(c=_t())!==n&&(f=Vt())!==n?i=l=[l,a,c,f]:(tt=i,i=n),ot--,i===n?s=void 0:(tt=s,s=n),s!==n&&(i=mt())!==n?r=e=[e,o,u,s,i]:(tt=r,r=n)):(tt=r,r=n)):(tt=r,r=n)):(tt=r,r=n),r!==n&&(t,r=function(t){return["lujvo",Ar(t)]}(r)),(t=r)===n&&(t=tt,(r=At())!==n&&(t,r=function(t){return["fu'ivla",Ar(t)]}(r)),t=r)))),ut[v]={nextPos:tt,result:t},t)}function Pt(){var t,r,e,o,u,s,i=67*tt+3,l=ut[i];if(l)return tt=l.nextPos,l.result;if(t=tt,r=tt,e=tt,ot++,o=St(),ot--,o!==n?(tt=e,e=void 0):e=n,e!==n){if(o=[],(u=Lt())!==n)for(;u!==n;)o.push(u),u=Lt();else o=n;o!==n?(u=tt,ot++,s=pr(),ot--,s!==n?(tt=u,u=void 0):u=n,u!==n?r=e=[e,o,u]:(tt=r,r=n)):(tt=r,r=n)}else tt=r,r=n;return r===n&&(r=St()),r!==n&&(t,r=["cmevla",Ar(r)]),t=r,ut[i]={nextPos:tt,result:t},t}function dt(){var t,r,e,o,u,s,i,l=67*tt+4,a=ut[l];return a?(tt=a.nextPos,a.result):(t=tt,(r=Ht())!==n?(e=tt,ot++,o=Kt(),ot--,o!==n?(tt=e,e=void 0):e=n,e!==n?(o=tt,ot++,u=Jt(),ot--,u!==n?(tt=o,o=void 0):o=n,o!==n&&(u=Zt())!==n?(s=tt,ot++,i=hr(),ot--,i!==n?(tt=s,s=void 0):s=n,s!==n?t=r=[r,e,o,u,s]:(tt=t,t=n)):(tt=t,t=n)):(tt=t,t=n)):(tt=t,t=n),ut[l]={nextPos:tt,result:t},t)}function ht(){var t,r,e,o,u,s,i,l,a=67*tt+5,c=ut[a];if(c)return tt=c.nextPos,c.result;if(t=tt,r=tt,ot++,e=$t(),ot--,e===n?r=void 0:(tt=r,r=n),r!==n)if(e=tt,ot++,o=yt(),ot--,o===n?e=void 0:(tt=e,e=n),e!==n)if(o=tt,ot++,u=tt,s=tt,ot++,i=$t(),ot--,i===n?s=void 0:(tt=s,s=n),s!==n&&(i=or())!==n&&(l=$t())!==n?u=s=[s,i,l]:(tt=u,u=n),ot--,u===n?o=void 0:(tt=o,o=n),o!==n)if(u=tt,ot++,s=dr(),ot--,s===n?u=void 0:(tt=u,u=n),u!==n)if(s=tt,ot++,i=Vt(),ot--,i!==n?(tt=s,s=void 0):s=n,s!==n){for(i=[],l=Gt();l!==n;)i.push(l),l=Gt();t=r=[r,e,o,u,s,i]}else tt=t,t=n;else tt=t,t=n;else tt=t,t=n;else tt=t,t=n;else tt=t,t=n;return ut[a]={nextPos:tt,result:t},t}function pt(){var t,r,e,o,u,s,i=67*tt+6,l=ut[i];if(l)return tt=l.nextPos,l.result;if(t=tt,(r=ht())!==n)if((e=Nt())!==n)if(o=tt,ot++,u=Kt(),ot--,u!==n?(tt=o,o=void 0):o=n,o!==n){for(u=[],s=Qt();s!==n;)u.push(s),s=Qt();t=r=[r,e,o,u]}else tt=t,t=n;else tt=t,t=n;else tt=t,t=n;return ut[i]={nextPos:tt,result:t},t}function gt(){var t,r,e,o=67*tt+7,u=ut[o];return u?(tt=u.nextPos,u.result):(t=tt,(r=pt())!==n&&(e=Jt())!==n?t=r=[r,e]:(tt=t,t=n),ut[o]={nextPos:tt,result:t},t)}function At(){var t,r,e,o,u,s,i,l,a,c,f=67*tt+8,v=ut[f];if(v)return tt=v.nextPos,v.result;if(t=tt,r=tt,ot++,e=gt(),ot--,e!==n?(tt=r,r=void 0):r=n,r!==n)if((e=Mt())===n&&(e=Ut())===n&&(e=Rt()),e!==n)if((o=ar())===n&&(o=lr())===n&&(o=sr()),o!==n){for(u=tt,s=[],i=Gt();i!==n;)s.push(i),i=Gt();if((i=Nt())!==n)if(l=tt,ot++,a=Kt(),ot--,a!==n?(tt=l,l=void 0):l=n,l!==n){for(a=[],c=Qt();c!==n;)a.push(c),c=Qt();(c=Jt())!==n?u=s=[s,i,l,a,c]:(tt=u,u=n)}else tt=u,u=n;else tt=u,u=n;u!==n?(t,t=Y(e,o,u)):(tt=t,t=n)}else tt=t,t=n;else tt=t,t=n;else tt=t,t=n;if(t===n){if(t=tt,r=tt,ot++,e=gt(),ot--,e!==n?(tt=r,r=void 0):r=n,r!==n)if((e=Ht())!==n)if((o=ar())===n&&(o=lr())===n&&(o=sr()),o!==n){for(u=tt,s=[],i=Gt();i!==n;)s.push(i),i=Gt();if((i=Nt())!==n)if(l=tt,ot++,a=Kt(),ot--,a!==n?(tt=l,l=void 0):l=n,l!==n){for(a=[],c=Qt();c!==n;)a.push(c),c=Qt();(c=Jt())!==n?u=s=[s,i,l,a,c]:(tt=u,u=n)}else tt=u,u=n;else tt=u,u=n;u===n&&(u=Jt()),u!==n?(t,t=Y(e,o,u)):(tt=t,t=n)}else tt=t,t=n;else tt=t,t=n;else tt=t,t=n;t===n&&(t=gt())}return ut[f]={nextPos:tt,result:t},t}function yt(){var t,r,e,o,u,s,i,l,a,c,f,v=67*tt+9,x=ut[v];if(x)return tt=x.nextPos,x.result;if(t=tt,r=tt,ot++,e=Pt(),ot--,e===n?r=void 0:(tt=r,r=n),r!==n)if(e=tt,ot++,o=tt,(u=Rt())!==n?(s=tt,ot++,i=Kt(),ot--,i===n?s=void 0:(tt=s,s=n),s!==n&&(i=_t())!==n?((l=dr())===n&&(l=null),(a=mt())!==n?o=u=[u,s,i,l,a]:(tt=o,o=n)):(tt=o,o=n)):(tt=o,o=n),o===n&&(o=tt,(u=Rt())!==n?(s=tt,ot++,i=Kt(),ot--,i!==n?(tt=s,s=void 0):s=n,s!==n&&(i=_t())!==n&&(l=Dt())!==n?o=u=[u,s,i,l]:(tt=o,o=n)):(tt=o,o=n)),ot--,o===n?e=void 0:(tt=e,e=n),e!==n){if(o=tt,u=tt,ot++,s=dr(),ot--,s===n?u=void 0:(tt=u,u=n),u!==n){if(s=tt,ot++,i=tt,(l=or())!==n){if(a=[],(c=or())!==n)for(;c!==n;)a.push(c),c=or();else a=n;a!==n?i=l=[l,a]:(tt=i,i=n)}else tt=i,i=n;if(ot--,i===n?s=void 0:(tt=s,s=n),s!==n)if((i=Vt())!==n){for(l=[],a=tt,(c=Wt())!==n&&(f=dr())!==n?a=c=[c,f]:(tt=a,a=n);a!==n;)l.push(a),a=tt,(c=Wt())!==n&&(f=dr())!==n?a=c=[c,f]:(tt=a,a=n);(a=Wt())!==n?o=u=[u,s,i,l,a]:(tt=o,o=n)}else tt=o,o=n;else tt=o,o=n}else tt=o,o=n;if(o===n)if(o=[],(u=_t())!==n)for(;u!==n;)o.push(u),u=_t();else o=n;o!==n?(u=tt,ot++,s=hr(),ot--,s!==n?(tt=u,u=void 0):u=n,u!==n?t=r=[r,e,o,u]:(tt=t,t=n)):(tt=t,t=n)}else tt=t,t=n;else tt=t,t=n;return ut[v]={nextPos:tt,result:t},t}function mt(){var t,r,e,o,u,s,i,l,a,c=67*tt+10,f=ut[c];if(f)return tt=f.nextPos,f.result;for(t=tt,r=[],e=tt,(o=Ot())===n&&(o=wt())===n&&(o=jt())===n&&(o=tt,u=tt,ot++,s=Et(),ot--,s===n?u=void 0:(tt=u,u=n),u!==n&&(s=zt())!==n?(i=tt,ot++,l=Et(),ot--,l===n?i=void 0:(tt=i,i=n),i!==n?o=u=[u,s,i]:(tt=o,o=n)):(tt=o,o=n)),o!==n&&(e,o=Z(o)),e=o;e!==n;)r.push(e),e=tt,(o=Ot())===n&&(o=wt())===n&&(o=jt())===n&&(o=tt,u=tt,ot++,s=Et(),ot--,s===n?u=void 0:(tt=u,u=n),u!==n&&(s=zt())!==n?(i=tt,ot++,l=Et(),ot--,l===n?i=void 0:(tt=i,i=n),i!==n?o=u=[u,s,i]:(tt=o,o=n)):(tt=o,o=n)),o!==n&&(e,o=Z(o)),e=o;return e=tt,(o=At())===n&&(o=Bt()),o!==n&&(e,o=[Ar(o)]),(e=o)===n&&(e=tt,(o=Ct())===n&&(o=bt())===n&&(o=Ft())===n&&(o=tt,(u=qt())!==n?(s=tt,ot++,i=Kt(),ot--,i!==n?(tt=s,s=void 0):s=n,s!==n?o=u=[u,s]:(tt=o,o=n)):(tt=o,o=n)),o!==n&&(u=Dt())!==n?(e,a=u,e=[Ar(o),"-",Ar(a)]):(tt=e,e=n)),e!==n?t=r=[r,e]:(tt=t,t=n),ut[c]={nextPos:tt,result:t},t}function Et(){var t,r=67*tt+11,e=ut[r];return e?(tt=e.nextPos,e.result):((t=At())===n&&(t=wt())===n&&(t=bt()),ut[r]={nextPos:tt,result:t},t)}function $t(){var t,r,e,o,u,s,i,l,a=67*tt+12,c=ut[a];if(c)return tt=c.nextPos,c.result;for(t=tt,r=[],e=zt();e!==n;)r.push(e),e=zt();return(e=Bt())===n&&(e=tt,(o=qt())!==n?(u=tt,ot++,s=Kt(),ot--,s!==n?(tt=u,u=void 0):u=n,u!==n?(s=tt,ot++,i=_t(),ot--,i===n?s=void 0:(tt=s,s=n),s!==n&&(i=Dt())!==n?e=o=[o,u,s,i]:(tt=e,e=n)):(tt=e,e=n)):(tt=e,e=n),e===n&&(e=jt())===n&&(e=Ft())===n&&(e=tt,o=tt,(u=qt())!==n?(s=tt,ot++,i=Kt(),ot--,i!==n?(tt=s,s=void 0):s=n,s!==n?(i=tt,ot++,l=_t(),ot--,l===n?i=void 0:(tt=i,i=n),i!==n?o=u=[u,s,i]:(tt=o,o=n)):(tt=o,o=n)):(tt=o,o=n),o===n&&(o=null),(u=er())!==n&&(s=_t())!==n?e=o=[o,u,s]:(tt=e,e=n),e===n&&(e=Ot())===n&&(e=Ct()))),e!==n?t=r=[r,e]:(tt=t,t=n),ut[a]={nextPos:tt,result:t},t}function St(){var t,r,e,o,u,s,i,l=67*tt+13,a=ut[l];if(a)return tt=a.nextPos,a.result;if(t=tt,r=tt,ot++,e=dr(),ot--,e===n?r=void 0:(tt=r,r=n),r!==n){for(e=[],(o=Wt())===n&&(o=Xt())===n&&(o=dr())===n&&(o=tt,(u=or())!==n?(s=tt,ot++,i=pr(),ot--,i===n?s=void 0:(tt=s,s=n),s!==n?o=u=[u,s]:(tt=o,o=n)):(tt=o,o=n));o!==n;)e.push(o),(o=Wt())===n&&(o=Xt())===n&&(o=dr())===n&&(o=tt,(u=or())!==n?(s=tt,ot++,i=pr(),ot--,i===n?s=void 0:(tt=s,s=n),s!==n?o=u=[u,s]:(tt=o,o=n)):(tt=o,o=n));(o=or())!==n?(u=tt,ot++,s=pr(),ot--,s!==n?(tt=u,u=void 0):u=n,u!==n?t=r=[r,e,o,u]:(tt=t,t=n)):(tt=t,t=n)}else tt=t,t=n;return ut[l]={nextPos:tt,result:t},t}function bt(){var t,r,e,o,u,s,i=67*tt+14,l=ut[i];return l?(tt=l.nextPos,l.result):(t=tt,(r=pt())!==n?(e=tt,(o=dr())!==n&&(u=_t())!==n?e=o=[o,u]:(tt=e,e=n),e!==n?(t,t=_(r,e)):(tt=t,t=n)):(tt=t,t=n),t===n&&(t=tt,r=tt,(e=pt())!==n&&(o=Vt())!==n?r=e=[e,o]:(tt=r,r=n),r!==n&&(e=_t())!==n?(t,s=e,t=[Ar(r),"-",Ar(s)]):(tt=t,t=n)),ut[i]={nextPos:tt,result:t},t)}function wt(){var t,r,e,o,u,s,i=67*tt+15,l=ut[i];return l?(tt=l.nextPos,l.result):(t=tt,r=tt,ot++,e=Gt(),ot--,e!==n?(tt=r,r=void 0):r=n,r!==n&&(e=ht())!==n?(o=tt,(u=dr())!==n&&(s=_t())!==n?o=u=[u,s]:(tt=o,o=n),o!==n?(t,t=_(e,o)):(tt=t,t=n)):(tt=t,t=n),t===n&&(t=tt,r=tt,(e=ht())!==n&&(o=Vt())!==n?r=e=[e,o]:(tt=r,r=n),r!==n?(e=tt,(o=_t())!==n?((u=dr())===n&&(u=null),e=o=[o,u]):(tt=e,e=n),e!==n?(t,t=_(r,e)):(tt=t,t=n)):(tt=t,t=n)),ut[i]={nextPos:tt,result:t},t)}function Ft(){var t,r,e,o,u=67*tt+16,s=ut[u];return s?(tt=s.nextPos,s.result):(t=tt,(r=Ht())===n&&(r=Rt()),r!==n?(e=tt,ot++,o=Kt(),ot--,o!==n?(tt=e,e=void 0):e=n,e!==n&&(o=_t())!==n?(t,t=_(r,o)):(tt=t,t=n)):(tt=t,t=n),ut[u]={nextPos:tt,result:t},t)}function jt(){var t,r,e,o,u,s=67*tt+17,i=ut[s];return i?(tt=i.nextPos,i.result):(t=tt,r=tt,(e=Ht())===n&&(e=Rt()),e!==n?(o=tt,ot++,u=Kt(),ot--,u===n?o=void 0:(tt=o,o=n),o!==n?r=e=[e,o]:(tt=r,r=n)):(tt=r,r=n),r!==n?(e=tt,(o=_t())!==n?((u=dr())===n&&(u=null),e=o=[o,u]):(tt=e,e=n),e!==n?(t,t=_(r,e)):(tt=t,t=n)):(tt=t,t=n),ut[s]={nextPos:tt,result:t},t)}function zt(){var t,r,e,o,u,s,i,l,a,c,f=67*tt+18,v=ut[f];return v?(tt=v.nextPos,v.result):(t=tt,r=tt,ot++,e=jt(),ot--,e===n?r=void 0:(tt=r,r=n),r!==n?(e=tt,ot++,o=Ft(),ot--,o===n?e=void 0:(tt=e,e=n),e!==n?(o=tt,ot++,u=Ot(),ot--,u===n?o=void 0:(tt=o,o=n),o!==n?(u=tt,ot++,s=Ct(),ot--,s===n?u=void 0:(tt=u,u=n),u!==n&&(s=qt())!==n?(i=tt,ot++,l=Kt(),ot--,l===n?i=void 0:(tt=i,i=n),i!==n?(l=tt,ot++,a=_t(),ot--,a===n?l=void 0:(tt=l,l=n),l!==n?(a=tt,ot++,c=dr(),ot--,c===n?a=void 0:(tt=a,a=n),a!==n?t=r=[r,e,o,u,s,i,l,a]:(tt=t,t=n)):(tt=t,t=n)):(tt=t,t=n)):(tt=t,t=n)):(tt=t,t=n)):(tt=t,t=n)):(tt=t,t=n),ut[f]={nextPos:tt,result:t},t)}function Ct(){var t,r,e,o,u,s,i=67*tt+19,l=ut[i];return l?(tt=l.nextPos,l.result):(t=tt,r=tt,(e=Ht())!==n&&(o=Zt())!==n?r=e=[e,o]:(tt=r,r=n),r===n&&(r=qt()),r!==n?(e=tt,ot++,o=Kt(),ot--,o!==n?(tt=e,e=void 0):e=n,e!==n?(o=tt,(u=dr())!==n&&(s=_t())!==n?o=u=[u,s]:(tt=o,o=n),o!==n?(t,t=_(r,o)):(tt=t,t=n)):(tt=t,t=n)):(tt=t,t=n),ut[i]={nextPos:tt,result:t},t)}function Ot(){var t,r,e,o,u,s,i,l,a=67*tt+20,c=ut[a];return c?(tt=c.nextPos,c.result):(t=tt,r=tt,(e=Ht())!==n&&(o=Zt())!==n?r=e=[e,o]:(tt=r,r=n),r===n&&(r=qt()),r!==n?(e=tt,o=tt,ot++,u=Kt(),ot--,u===n?o=void 0:(tt=o,o=n),o!==n&&(u=dr())!==n&&(s=_t())!==n?((i=dr())===n&&(i=null),e=o=[o,u,s,i]):(tt=e,e=n),e!==n?(t,l=e,t=[Ar(r),"-",Ar(l)]):(tt=t,t=n)):(tt=t,t=n),ut[a]={nextPos:tt,result:t},t)}function Rt(){var t,r,e,o=67*tt+21,u=ut[o];return u?(tt=u.nextPos,u.result):(t=tt,(r=It())!==n&&(e=or())!==n?t=r=[r,e]:(tt=t,t=n),ut[o]={nextPos:tt,result:t},t)}function kt(){var t,r=67*tt+22,e=ut[r];return e?(tt=e.nextPos,e.result):((t=Rt())===n&&(t=Mt()),ut[r]={nextPos:tt,result:t},t)}function Mt(){var t,r,e,o=67*tt+23,u=ut[o];return u?(tt=u.nextPos,u.result):(t=tt,(r=er())!==n&&(e=Zt())!==n?t=r=[r,e]:(tt=t,t=n),ut[o]={nextPos:tt,result:t},t)}function Ut(){var t,r,e,o=67*tt+24,u=ut[o];return u?(tt=u.nextPos,u.result):(t=tt,(r=or())!==n&&(e=Yt())!==n?t=r=[r,e]:(tt=t,t=n),ut[o]={nextPos:tt,result:t},t)}function qt(){var t,r=67*tt+25,e=ut[r];return e?(tt=e.nextPos,e.result):((t=kt())===n&&(t=function(){var t,r,e,o,u,s,i,l=67*tt+26,a=ut[l];if(a)return tt=a.nextPos,a.result;t=tt,r=tt,(e=or())!==n&&(o=Zt())!==n?(u=tt,ot++,s=Kt(),ot--,s===n?u=void 0:(tt=u,u=n),u!==n&&(s=dr())!==n&&(i=Zt())!==n?r=e=[e,o,u,s,i]:(tt=r,r=n)):(tt=r,r=n);r===n&&(r=Ut());r!==n?(e=tt,(o=ar())!==n?(u=tt,ot++,s=or(),ot--,s!==n?(tt=u,u=void 0):u=n,u!==n?e=o=[o,u]:(tt=e,e=n)):(tt=e,e=n),e===n&&(e=tt,(o=lr())!==n?(u=tt,ot++,s=ar(),ot--,s!==n?(tt=u,u=void 0):u=n,u!==n?e=o=[o,u]:(tt=e,e=n)):(tt=e,e=n)),e===n&&(e=null),t,t=_(r,e)):(tt=t,t=n);return ut[l]={nextPos:tt,result:t},t}()),ut[r]={nextPos:tt,result:t},t)}function Bt(){var t,r,e,o,u,s,i,l,a=67*tt+27,c=ut[a];return c?(tt=c.nextPos,c.result):((t=dt())===n&&(t=tt,(r=It())!==n?(e=tt,ot++,o=Kt(),ot--,o!==n?(tt=e,e=void 0):e=n,e!==n&&(o=dr())!==n?(u=tt,ot++,s=Jt(),ot--,s!==n?(tt=u,u=void 0):u=n,u!==n&&(s=Zt())!==n?(i=tt,ot++,l=hr(),ot--,l!==n?(tt=i,i=void 0):i=n,i!==n?t=r=[r,e,o,u,s,i]:(tt=t,t=n)):(tt=t,t=n)):(tt=t,t=n)):(tt=t,t=n)),ut[a]={nextPos:tt,result:t},t)}function Dt(){var t,r,e,o,u,s=67*tt+28,i=ut[s];return i?(tt=i.nextPos,i.result):(t=tt,r=tt,ot++,e=Jt(),ot--,e!==n?(tt=r,r=void 0):r=n,r!==n?(e=tt,(o=or())!==n&&(u=Yt())!==n?e=o=[o,u]:(tt=e,e=n),e===n&&(e=Mt()),e!==n?(o=tt,ot++,u=hr(),ot--,u!==n?(tt=o,o=void 0):o=n,o!==n?t=r=[r,e,o]:(tt=t,t=n)):(tt=t,t=n)):(tt=t,t=n),ut[s]={nextPos:tt,result:t},t)}function Gt(){var t,r,e,o,u=67*tt+29,s=ut[u];return s?(tt=s.nextPos,s.result):(t=tt,(r=Nt())!==n?(e=tt,ot++,o=Kt(),ot--,o===n?e=void 0:(tt=e,e=n),e!==n?t=r=[r,e]:(tt=t,t=n)):(tt=t,t=n),t===n&&(t=Qt()),ut[u]={nextPos:tt,result:t},t)}function Ht(){var t,r,e,o=67*tt+30,u=ut[o];return u?(tt=u.nextPos,u.result):(t=tt,(r=kt())!==n&&(e=or())!==n?t=r=[r,e]:(tt=t,t=n),ut[o]={nextPos:tt,result:t},t)}function It(){var t,r,e,o=67*tt+31,u=ut[o];return u?(tt=u.nextPos,u.result):(t=tt,(r=or())!==n&&(e=Zt())!==n?t=r=[r,e]:(tt=t,t=n),ut[o]={nextPos:tt,result:t},t)}function Jt(){var t,r,e,o,u,s,i,l=67*tt+32,a=ut[l];return a?(tt=a.nextPos,a.result):(t=tt,(r=Vt())!==n?(e=tt,ot++,o=_t(),ot--,o===n?e=void 0:(tt=e,e=n),e!==n&&(o=Wt())!==n?(u=tt,ot++,s=Pt(),ot--,s===n?u=void 0:(tt=u,u=n),u!==n?(s=tt,ot++,i=hr(),ot--,i!==n?(tt=s,s=void 0):s=n,s!==n?t=r=[r,e,o,u,s]:(tt=t,t=n)):(tt=t,t=n)):(tt=t,t=n)):(tt=t,t=n),ut[l]={nextPos:tt,result:t},t)}function Kt(){var t,r,e,o,u,s,i=67*tt+33,l=ut[i];if(l)return tt=l.nextPos,l.result;for(t=tt,r=[],(e=or())===n&&(e=Xt());e!==n;)r.push(e),(e=or())===n&&(e=Xt());return(e=dr())===n&&(e=null),(o=_t())===n&&(o=null),(u=Nt())!==n&&(s=pr())!==n?t=r=[r,e,o,u,s]:(tt=t,t=n),ut[i]={nextPos:tt,result:t},t}function Lt(){var t,r,e,o,u=67*tt+34,s=ut[u];return s?(tt=s.nextPos,s.result):(t=tt,(r=Vt())!==n&&(e=Wt())!==n?((o=Tt())===n&&(o=null),t=r=[r,e,o]):(tt=t,t=n),t===n&&(t=Qt()),ut[u]={nextPos:tt,result:t},t)}function Nt(){var t,r,e,o,u,s=67*tt+35,i=ut[s];return i?(tt=i.nextPos,i.result):(t=tt,(r=Vt())!==n?(e=tt,ot++,o=_t(),ot--,o===n?e=void 0:(tt=e,e=n),e!==n&&(o=Wt())!==n?((u=Tt())===n&&(u=null),t=r=[r,e,o,u]):(tt=t,t=n)):(tt=t,t=n),ut[s]={nextPos:tt,result:t},t)}function Qt(){var t,r,e,o,u=67*tt+36,s=ut[u];return s?(tt=s.nextPos,s.result):(t=tt,(r=or())!==n?(e=tt,ot++,o=ur(),ot--,o!==n?(tt=e,e=void 0):e=n,e!==n&&(o=Tt())!==n?t=r=[r,e,o]:(tt=t,t=n)):(tt=t,t=n),ut[u]={nextPos:tt,result:t},t)}function Tt(){var t,r,e,o,u,s=67*tt+37,i=ut[s];return i?(tt=i.nextPos,i.result):(t=tt,r=tt,ot++,e=Lt(),ot--,e===n?r=void 0:(tt=r,r=n),r!==n&&(e=or())!==n?(o=tt,ot++,u=Lt(),ot--,u!==n?(tt=o,o=void 0):o=n,o!==n?t=r=[r,e,o]:(tt=t,t=n)):(tt=t,t=n),t===n&&(t=tt,(r=ur())===n&&(r=null),(e=or())===n&&(e=null),o=tt,ot++,u=pr(),ot--,u!==n?(tt=o,o=void 0):o=n,o!==n?t=r=[r,e,o]:(tt=t,t=n)),ut[s]={nextPos:tt,result:t},t)}function Vt(){var r,e,o,u,s,i,l,a,c=67*tt+38,f=ut[c];return f?(tt=f.nextPos,f.result):(r=tt,(e=dr())===n&&(e=Xt())===n&&(e=nr())===n&&(e=tt,o=tt,(u=xr())!==n?(s=tt,ot++,i=function(){var r,e=67*tt+60,o=ut[e];if(o)return tt=o.nextPos,o.result;$.test(t.charAt(tt))?(r=t.charAt(tt),tt++):(r=n,0===ot&&at(L));return ut[e]={nextPos:tt,result:r},r}(),ot--,i===n?s=void 0:(tt=s,s=n),s!==n?o=u=[u,s]:(tt=o,o=n)):(tt=o,o=n),o===n&&(o=tt,(u=vr())!==n?(s=tt,ot++,(i=lr())===n&&(i=sr())===n&&(i=ar()),ot--,i===n?s=void 0:(tt=s,s=n),s!==n?o=u=[u,s]:(tt=o,o=n)):(tt=o,o=n)),o===n&&(o=null),(u=cr())===n&&(u=tt,(s=Pr())===n&&(s=fr())===n&&(s=tt,(i=lr())!==n?(l=tt,ot++,a=ar(),ot--,a===n?l=void 0:(tt=l,l=n),l!==n?s=i=[i,l]:(tt=s,s=n)):(tt=s,s=n)),s!==n?(i=tt,ot++,l=sr(),ot--,l===n?i=void 0:(tt=i,i=n),i!==n?u=s=[s,i]:(tt=u,u=n)):(tt=u,u=n),u===n&&(u=ir())),u===n&&(u=null),(s=sr())===n&&(s=ar()),s===n&&(s=null),e=o=[o,u,s]),e!==n?(o=tt,ot++,u=or(),ot--,u===n?o=void 0:(tt=o,o=n),o!==n?(u=tt,ot++,s=Xt(),ot--,s===n?u=void 0:(tt=u,u=n),u!==n?r=e=[e,o,u]:(tt=r,r=n)):(tt=r,r=n)):(tt=r,r=n),ut[c]={nextPos:tt,result:r},r)}function Wt(){var t,r,e,o,u=67*tt+39,s=ut[u];return s?(tt=s.nextPos,s.result):((t=Zt())===n&&(t=Yt())===n&&(t=tt,(r=_t())!==n?(e=tt,ot++,o=Wt(),ot--,o===n?e=void 0:(tt=e,e=n),e!==n?t=r=[r,e]:(tt=t,t=n)):(tt=t,t=n)),ut[u]={nextPos:tt,result:t},t)}function Xt(){var t,r,e,o,u=67*tt+40,s=ut[u];return s?(tt=s.nextPos,s.result):(t=tt,(r=tr())===n&&(r=rr()),r!==n?(e=tt,ot++,o=Wt(),ot--,o!==n?(tt=e,e=void 0):e=n,e!==n?t=r=[r,e]:(tt=t,t=n)):(tt=t,t=n),ut[u]={nextPos:tt,result:t},t)}function Yt(){var r,e,o,u,s,a,v=67*tt+41,x=ut[v];return x?(tt=x.nextPos,x.result):(r=tt,e=tt,i.test(t.charAt(tt))?(o=t.charAt(tt),tt++):(o=n,0===ot&&at(j)),o!==n&&(u=rr())!==n?(s=tt,ot++,a=function(){var r,e=67*tt+44,o=ut[e];if(o)return tt=o.nextPos,o.result;f.test(t.charAt(tt))?(r=t.charAt(tt),tt++):(r=n,0===ot&&at(R));return ut[e]={nextPos:tt,result:r},r}(),ot--,a===n?s=void 0:(tt=s,s=n),s!==n?e=o=[o,u,s]:(tt=e,e=n)):(tt=e,e=n),e===n&&(e=tt,l.test(t.charAt(tt))?(o=t.charAt(tt),tt++):(o=n,0===ot&&at(z)),o!==n&&(u=tr())!==n?(s=tt,ot++,a=function(){var r,e=67*tt+43,o=ut[e];if(o)return tt=o.nextPos,o.result;c.test(t.charAt(tt))?(r=t.charAt(tt),tt++):(r=n,0===ot&&at(O));return ut[e]={nextPos:tt,result:r},r}(),ot--,a===n?s=void 0:(tt=s,s=n),s!==n?e=o=[o,u,s]:(tt=e,e=n)):(tt=e,e=n)),e!==n?(o=tt,ot++,u=Wt(),ot--,u===n?o=void 0:(tt=o,o=n),o!==n?r=e=[e,o]:(tt=r,r=n)):(tt=r,r=n),ut[v]={nextPos:tt,result:r},r)}function Zt(){var r,e,o,u,s=67*tt+42,i=ut[s];return i?(tt=i.nextPos,i.result):(r=tt,a.test(t.charAt(tt))?(e=t.charAt(tt),tt++):(e=n,0===ot&&at(C)),e!==n?(o=tt,ot++,u=Wt(),ot--,u===n?o=void 0:(tt=o,o=n),o!==n?r=e=[e,o]:(tt=r,r=n)):(tt=r,r=n),ut[s]={nextPos:tt,result:r},r)}function _t(){var r,e,o,u,s,i,l=67*tt+45,a=ut[l];return a?(tt=a.nextPos,a.result):(r=tt,v.test(t.charAt(tt))?(e=t.charAt(tt),tt++):(e=n,0===ot&&at(k)),e!==n?(o=tt,ot++,u=tt,s=tt,ot++,i=_t(),ot--,i===n?s=void 0:(tt=s,s=n),s!==n&&(i=Wt())!==n?u=s=[s,i]:(tt=u,u=n),ot--,u===n?o=void 0:(tt=o,o=n),o!==n?r=e=[e,o]:(tt=r,r=n)):(tt=r,r=n),ut[l]={nextPos:tt,result:r},r)}function tr(){var r,e=67*tt+46,o=ut[e];return o?(tt=o.nextPos,o.result):(x.test(t.charAt(tt))?(r=t.charAt(tt),tt++):(r=n,0===ot&&at(M)),ut[e]={nextPos:tt,result:r},r)}function rr(){var r,e,o=67*tt+47,u=ut[o];return u?(tt=u.nextPos,u.result):(r=tt,P.test(t.charAt(tt))?(e=t.charAt(tt),tt++):(e=n,0===ot&&at(U)),e!==n&&(r,e=["u",""]),r=e,ut[o]={nextPos:tt,result:r},r)}function er(){var t,r,e,o,u,s,i=67*tt+48,l=ut[i];return l?(tt=l.nextPos,l.result):(t=tt,r=tt,ot++,e=Vt(),ot--,e!==n?(tt=r,r=void 0):r=n,r!==n&&(e=or())!==n&&(o=or())!==n?(u=tt,ot++,s=or(),ot--,s===n?u=void 0:(tt=u,u=n),u!==n?t=r=[r,e,o,u]:(tt=t,t=n)):(tt=t,t=n),ut[i]={nextPos:tt,result:t},t)}function nr(){var t,r,e,o=67*tt+49,u=ut[o];return u?(tt=u.nextPos,u.result):(t=tt,(r=Pr())!==n&&(e=xr())!==n?t=r=[r,e]:(tt=t,t=n),t===n&&(t=tt,(r=fr())!==n&&(e=vr())!==n?t=r=[r,e]:(tt=t,t=n)),ut[o]={nextPos:tt,result:t},t)}function or(){var t,r=67*tt+50,e=ut[r];return e?(tt=e.nextPos,e.result):((t=cr())===n&&(t=fr())===n&&(t=vr())===n&&(t=xr())===n&&(t=Pr())===n&&(t=ur()),ut[r]={nextPos:tt,result:t},t)}function ur(){var t,r=67*tt+51,e=ut[r];return e?(tt=e.nextPos,e.result):((t=sr())===n&&(t=ir())===n&&(t=lr())===n&&(t=ar()),ut[r]={nextPos:tt,result:t},t)}function sr(){var r,e=67*tt+52,o=ut[e];return o?(tt=o.nextPos,o.result):(d.test(t.charAt(tt))?(r=t.charAt(tt),tt++):(r=n,0===ot&&at(q)),ut[e]={nextPos:tt,result:r},r)}function ir(){var r,e=67*tt+53,o=ut[e];return o?(tt=o.nextPos,o.result):(h.test(t.charAt(tt))?(r=t.charAt(tt),tt++):(r=n,0===ot&&at(B)),ut[e]={nextPos:tt,result:r},r)}function lr(){var r,e,o,u,s=67*tt+54,i=ut[s];return i?(tt=i.nextPos,i.result):(r=tt,p.test(t.charAt(tt))?(e=t.charAt(tt),tt++):(e=n,0===ot&&at(D)),e!==n?(o=tt,ot++,u=nr(),ot--,u===n?o=void 0:(tt=o,o=n),o!==n?r=e=[e,o]:(tt=r,r=n)):(tt=r,r=n),ut[s]={nextPos:tt,result:r},r)}function ar(){var r,e=67*tt+55,o=ut[e];return o?(tt=o.nextPos,o.result):(g.test(t.charAt(tt))?(r=t.charAt(tt),tt++):(r=n,0===ot&&at(G)),ut[e]={nextPos:tt,result:r},r)}function cr(){var r,e=67*tt+56,o=ut[e];return o?(tt=o.nextPos,o.result):(A.test(t.charAt(tt))?(r=t.charAt(tt),tt++):(r=n,0===ot&&at(H)),ut[e]={nextPos:tt,result:r},r)}function fr(){var r,e=67*tt+57,o=ut[e];return o?(tt=o.nextPos,o.result):(y.test(t.charAt(tt))?(r=t.charAt(tt),tt++):(r=n,0===ot&&at(I)),ut[e]={nextPos:tt,result:r},r)}function vr(){var r,e=67*tt+58,o=ut[e];return o?(tt=o.nextPos,o.result):(m.test(t.charAt(tt))?(r=t.charAt(tt),tt++):(r=n,0===ot&&at(J)),ut[e]={nextPos:tt,result:r},r)}function xr(){var r,e=67*tt+59,o=ut[e];return o?(tt=o.nextPos,o.result):(E.test(t.charAt(tt))?(r=t.charAt(tt),tt++):(r=n,0===ot&&at(K)),ut[e]={nextPos:tt,result:r},r)}function Pr(){var r,e=67*tt+61,o=ut[e];return o?(tt=o.nextPos,o.result):(S.test(t.charAt(tt))?(r=t.charAt(tt),tt++):(r=n,0===ot&&at(N)),ut[e]={nextPos:tt,result:r},r)}function dr(){var r,e,o,u,s=67*tt+62,i=ut[s];return i?(tt=i.nextPos,i.result):(r=tt,b.test(t.charAt(tt))?(e=t.charAt(tt),tt++):(e=n,0===ot&&at(Q)),e!==n?(o=tt,ot++,u=Wt(),ot--,u!==n?(tt=o,o=void 0):o=n,o!==n?r=e=[e,o]:(tt=r,r=n)):(tt=r,r=n),ut[s]={nextPos:tt,result:r},r)}function hr(){var r,e,o,u=67*tt+63,s=ut[u];return s?(tt=s.nextPos,s.result):((r=pr())===n&&(r=tt,e=tt,ot++,o=Wt(),ot--,o===n?e=void 0:(tt=e,e=n),e!==n&&(o=xt())!==n?r=e=[e,o]:(tt=r,r=n),r===n&&(w.test(t.charAt(tt))?(r=t.charAt(tt),tt++):(r=n,0===ot&&at(T)))),ut[u]={nextPos:tt,result:r},r)}function pr(){var r,e,o=67*tt+64,u=ut[o];return u?(tt=u.nextPos,u.result):((r=gr())===n&&(r=tt,ot++,t.length>tt?(e=t.charAt(tt),tt++):(e=n,0===ot&&at(V)),ot--,e===n?r=void 0:(tt=r,r=n)),ut[o]={nextPos:tt,result:r},r)}function gr(){var r,e,o,u=67*tt+65,s=ut[u];if(s)return tt=s.nextPos,s.result;if(r=tt,e=[],F.test(t.charAt(tt))?(o=t.charAt(tt),tt++):(o=n,0===ot&&at(W)),o!==n)for(;o!==n;)e.push(o),F.test(t.charAt(tt))?(o=t.charAt(tt),tt++):(o=n,0===ot&&at(W));else e=n;return e!==n&&(r,e=["drata",Ar(e)]),r=e,ut[u]={nextPos:tt,result:r},r}function Ar(t){if("string"==typeof t)return t;var r="";for(var e in t)r+=Ar(t[e]);return r}function yr(t){if("string"==typeof t)return t;var r=[];for(var e in t)r.push(yr(t[e]));return r}if((e=s())!==n&&tt===t.length)return e;throw e!==n&&tt<t.length&&at({type:"end"}),ct(nt,et<t.length?t.charAt(et):null,et<t.length?lt(et,et+1):lt(et,et))}peg$subclass(peg$SyntaxError,Error),peg$SyntaxError.prototype.format=function(t){var r="Error: "+this.message;if(this.location){var e,n=null;for(e=0;e<t.length;e++)if(t[e].source===this.location.source){n=t[e].text.split(/\r\n|\n|\r/g);break}var o=this.location.start,u=this.location.source+":"+o.line+":"+o.column;if(n){var s=this.location.end,i=peg$padEnd("",o.line.toString().length),l=n[o.line-1],a=o.line===s.line?s.column:l.length+1;r+="\n --\x3e "+u+"\n"+i+" |\n"+o.line+" | "+l+"\n"+i+" | "+peg$padEnd("",o.column-1)+peg$padEnd("",a-o.column,"^")}else r+="\n at "+u}return r},peg$SyntaxError.buildMessage=function(t,r){var e={literal:function(t){return'"'+o(t.text)+'"'},class:function(t){var r=t.parts.map((function(t){return Array.isArray(t)?u(t[0])+"-"+u(t[1]):u(t)}));return"["+(t.inverted?"^":"")+r+"]"},any:function(){return"any character"},end:function(){return"end of input"},other:function(t){return t.description}};function n(t){return t.charCodeAt(0).toString(16).toUpperCase()}function o(t){return t.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\0/g,"\\0").replace(/\t/g,"\\t").replace(/\n/g,"\\n").replace(/\r/g,"\\r").replace(/[\x00-\x0F]/g,(function(t){return"\\x0"+n(t)})).replace(/[\x10-\x1F\x7F-\x9F]/g,(function(t){return"\\x"+n(t)}))}function u(t){return t.replace(/\\/g,"\\\\").replace(/\]/g,"\\]").replace(/\^/g,"\\^").replace(/-/g,"\\-").replace(/\0/g,"\\0").replace(/\t/g,"\\t").replace(/\n/g,"\\n").replace(/\r/g,"\\r").replace(/[\x00-\x0F]/g,(function(t){return"\\x0"+n(t)})).replace(/[\x10-\x1F\x7F-\x9F]/g,(function(t){return"\\x"+n(t)}))}function s(t){return e[t.type](t)}return"Expected "+function(t){var r,e,n=t.map(s);if(n.sort(),n.length>0){for(r=1,e=1;r<n.length;r++)n[r-1]!==n[r]&&(n[e]=n[r],e++);n.length=e}switch(n.length){case 1:return n[0];case 2:return n[0]+" or "+n[1];default:return n.slice(0,-1).join(", ")+", or "+n[n.length-1]}}(t)+" but "+function(t){return t?'"'+o(t)+'"':"end of input"}(r)+" found."},module.exports={SyntaxError:peg$SyntaxError,parse:peg$parse};