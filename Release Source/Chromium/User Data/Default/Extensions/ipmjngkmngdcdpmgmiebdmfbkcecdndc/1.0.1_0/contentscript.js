window.top === window && chrome.runtime.sendMessage({type:'reset'});
document.addEventListener('canvasfingerprintblock', function(a) {
  a = a.detail;
  var b = document.getElementById(a.proxyCanvasId);
  document.body.removeChild(b);
  b = b.toDataURL();
  chrome.runtime.sendMessage({type:'block', dataURL:b, method:a.method, args:a.args, width:a.width, height:a.height});
});
var c = document.documentElement.getAttribute('onreset');
document.documentElement.setAttribute('onreset', "(function(){function m(){if(Function.prototype.call===d&&Function.prototype.apply===e){var a=n.call(arguments,0),g=this.canvas;b.width=g.width;b.height=g.height;var h=k.apply(p,a);f(g,'getImageData',a);return h}}function q(){if(Function.prototype.call===d&&Function.prototype.apply===e)return b.width=this.width,b.height=this.height,f(this,'toDataURL'),r.call(b)}function f(a,b,h){var c=document.createElement('canvas'),d=c.width=a.width,e=c.height=a.height;a=l.call(a,'2d');a=k.call(a,0,0,d,e);var f=l.call(c,'2d');s.call(f,a,0,0);c.style.display='none';a='hchdjfdgedmgedlamifegagalinjnhhe-proxy-canvas-'+t++;c.id=a;document.body.appendChild(c);document.dispatchEvent(new u('canvasfingerprintblock',{detail:{proxyCanvasId:a,method:b,args:h,width:d,height:e}}))}var r=HTMLCanvasElement.prototype.toDataURL,l=HTMLCanvasElement.prototype.getContext,k=CanvasRenderingContext2D.prototype.getImageData,s=CanvasRenderingContext2D.prototype.putImageData,d=Function.prototype.call,e=Function.prototype.apply,u=CustomEvent,b=document.createElement('canvas'),p=b.getContext('2d'),n=Array.prototype.slice,t=0;HTMLCanvasElement.prototype.toDataURL=function(){return q.apply(this,arguments)};CanvasRenderingContext2D.prototype.getImageData=function(){return m.apply(this,arguments)}})();");
var d = new CustomEvent('reset');
document.documentElement.dispatchEvent(d);
null === c ? document.documentElement.removeAttribute('onreset') : document.documentElement.setAttribute('onreset', c);

