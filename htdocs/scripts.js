'use strict';var g=null;
window.$={k:function(a,b){return"https://api.twitch.tv/kraken/"+a+"/ferretbomb"+b},j:function(a){var b=$.b;a&&(b=$.d);a=$.a("onair");b(a,"online")},l:function(){function a(){if(!this.readyState||!("loaded"!==this.readyState&&"complete"!==this.readyState))try{this.onload=this.onreadystatechange=g,this.parentNode.removeChild(this)}catch(a){}}var b=0;return function(c,e){var d="callback_json"+ ++b,f=$.h("script");f.src=c+(-1===c.toString().indexOf("?")?"?":"&")+"callback="+d;f.async=!0;window[d]=function(a){e(a);
window[d]=g;try{delete window[d]}catch(c){}};f.onload=f.onreadystatechange=a;$.f($.i("head")[0],f);return d}}(),p:function(a,b){for(var c="",e=0,d=$.a(a).firstChild;d;d=d.nextSibling){var f=/^[Hh]([1-6])$/.exec(d.nodeName);f!==g&&(f=parseInt(f[1],10),e===f?c+="</li><li>":(c+=Array(Math.abs(e-f)+1).join(e<f?"<ol><li>":"</li></ol></li><li>"),e=f),c=$.q(d,"id")?c+('<a href="#'+$.g(d,"id")+'">'+d.innerHTML+"</a>"):c+d.innerHTML)}c+=Array(e+1).join("</li></ol>");c=c.split("<ol");for(e=1;e<c.length;e++)-1!==
c[e].indexOf("</ol>")&&(c[e]=' class="leaf"'+c[e]);c=c.join("<ol").split("<li");for(e=1;e<c.length;e++)-1===c[e].indexOf("<ol")&&(c[e]=' class="leaf"'+c[e]);$.a(b).innerHTML=c.join("<li")},c:function(){$.l($.k("streams",""),function(a){a.stream===g?(setTimeout($.c,6E4),$.j(!1)):($.j(!0),setTimeout($.c,6E5))})},e:function(a){return RegExp("(?:^|\\s)"+a+"(?!\\S)","g")},n:function(a,b){return $.e(b).test(a.className)},d:function(a,b){a.className+=" "+b;return a},b:function(a,b){a.className=a.className.replace($.e(b),
"");return a},s:function(a,b){$.n(a,b)?$.b(a,b):$.d(a,b);return a},o:function(a,b,c){a.attachEvent?a.attachEvent("on"+b,c):a.addEventListener(b,c,!1);return a},h:function(a){return document.createElement(a)},i:function(a){return document.getElementsByTagName(a)},a:function(a){return document.getElementById(a)},q:function(a,b){return a.hasAttribute(b)},g:function(a,b){return a.getAttribute(b)},r:function(a,b,c){a.setAttribute(b,c)},f:function(a,b){a.appendChild(b)},JSON:function(a,b){var c=function(){try{return new XMLHttpRequest}catch(a){}try{return new ActiveXObject("Mxsml2.XMLHTTP")}catch(c){}return g}();
c.open("GET",a,!0);c.onreadystatechange=function(){4==this.readyState&&b(JSON.parse(this.responseText))};c.send(g)},m:function(){$.JSON("/headers/index.json",function(a){a=a[Math.floor(Math.random()*a.length)];$.a("logo").style.backgroundImage="url(/headers/"+a+".png)"})},init:{article:function(){var a=$.i("header")[0],b=$.h("div");$.r(b,"id","outline");$.f(a,b);$.o(b,"click",function(a){for(var b=document.querySelectorAll(".expanded"),d=0;d<b.length;d++)$.b(b[d],"expanded");for(d=a.toElement;d&&
"outline"!==$.g(d,"id");d=d.parentNode)$.d(d,"expanded");return!0});$.p("content","outline")},stream:function(){$.b($.a("onair"),"enabled")}}};setTimeout($.c,1E3);$.m();
