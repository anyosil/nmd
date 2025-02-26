var _____WB$wombat$assign$function_____ = function(name) {return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name)) || self[name]; };
if (!self.__WB_pmw) { self.__WB_pmw = function(obj) { this.__WB_source = obj; return this; } }
{
  let window = _____WB$wombat$assign$function_____("window");
  let self = _____WB$wombat$assign$function_____("self");
  let document = _____WB$wombat$assign$function_____("document");
  let location = _____WB$wombat$assign$function_____("location");
  let top = _____WB$wombat$assign$function_____("top");
  let parent = _____WB$wombat$assign$function_____("parent");
  let frames = _____WB$wombat$assign$function_____("frames");
  let opener = _____WB$wombat$assign$function_____("opener");

LazyLoad=function(){var n=document,m,q={},o={css:[],js:[]},r;
function d(b,c){var a=n.createElement(b),e;
for(e in c){if(c.hasOwnProperty(e)){a.setAttribute(e,c[e])
}}return a
}function l(e){var b=q[e];
if(!b){return
}var a=b.callback,c=b.urls;
c.shift();
if(!c.length){if(a){a.call(b.scope||window,b.obj)
}q[e]=null;
if(o[e].length){k(e)
}}}function p(){if(r){return
}var b=navigator.userAgent,a=parseFloat,c;
r={gecko:0,ie:0,opera:0,webkit:0};
c=b.match(/AppleWebKit\/(\S*)/);
if(c&&c[1]){r.webkit=a(c[1])
}else{c=b.match(/MSIE\s([^;]*)/);
if(c&&c[1]){r.ie=a(c[1])
}else{if((/Gecko\/(\S*)/).test(b)){r.gecko=1;
c=b.match(/rv:([^\s\)]*)/);
if(c&&c[1]){r.gecko=a(c[1])
}}else{if(c=b.match(/Opera\/(\S*)/)){r.opera=a(c[1])
}}}}}function k(a,b,v,f,u){var e,c,g,h,j;
p();
if(b){b=b.constructor===Array?b:[b];
if(a==="css"||r.gecko||r.opera){o[a].push({urls:[].concat(b),callback:v,obj:f,scope:u})
}else{for(e=0,c=b.length;
e<c;
++e){o[a].push({urls:[b[e]],callback:e===c-1?v:null,obj:f,scope:u})
}}}if(q[a]||!(h=q[a]=o[a].shift())){return
}m=m||n.getElementsByTagName("head")[0];
b=h.urls;
for(e=0,c=b.length;
e<c;
++e){j=b[e];
if(a==="css"){g=d("link",{href:j,rel:"stylesheet",type:"text/css"})
}else{g=d("script",{src:j})
}if(r.ie){g.onreadystatechange=function(){var s=this.readyState;
if(s==="loaded"||s==="complete"){this.onreadystatechange=null;
l(a)
}}
}else{if(a==="css"&&(r.gecko||r.webkit)){setTimeout(function(){l(a)
},50*c)
}else{g.onload=g.onerror=function(){l(a)
}
}}m.appendChild(g)
}}return{css:function(b,a,c,e){k("css",b,a,c,e)
},js:function(b,a,c,e){k("js",b,a,c,e)
}}
}();
NPSurvey=function(u){var M=false;
var K=7;
var A="nps_";
var j=(Math.floor(Math.random()*101));
var f=(1000*60*60*24);
var s=[0,10];
var p={};
var g=false;
var h="2.2";
var v=false;
var G=false;
var w="https://web.archive.org/web/20110804081630/http://sibetaq01.ext.nokia.com";
var o="https://web.archive.org/web/20110804081630/http://static.nps.nokia.com";
var t="../../../../2/http_/nps-2.2/nps.html";
var E="../../../../2/http_/nps-2.2/jquery-1.4.1.min.html";
var I={id:false,lang:"en",qa_mode:false,debug:false,render_always:false,render_never:false,render_interval:4,render_overlay:false,render_id:false,render_close:1,render_abandon:1,render_submit:9999,feedback_req:false,change_email:true,beforeOpen:false,afterOpen:false,onVote:false,onSubmit:false,beforeClose:false,afterClose:false};
var F=function(O){if(!O||O.id==undefined){return q("No widget ID specified.")
}if(!O.render_id){var N="nps"+O.id+"embed";
O.render_id=N
}if(!O.render_overlay&&!O.render_id){document.write('<div id="'+O.render_id+'"> </div>')
}if(O.debug){document.write('<div id="nps_debug"> </div>')
}if(O&&O!=undefined){for(var P in O){if(I[P]!==undefined){I[P]=O[P]
}}A+=O.id
}H(function(){x(O)
})
};
var x=function(O){if(!jQuery){return false
}M=jQueryui;
a();
n("_initLoaded");
if(!d()){return false
}var N=(I.qa_mode==true)?w:o;
LazyLoad.css(N+t,function(){e(O)
})
};
var e=function(O){var P=(I.qa_mode==true)?w:o;
var N=P+"/nps-2.1/nps_widget/l10n/getLang.php&lang="+I.lang;
M.getJSON(P+"/nps-2.1/nps_widget/scripts/Jsonp.php?url="+N+"&jsoncallback=?",function(Q){if(O.texts==undefined){O.texts=[]
}p.score_question=Q.texts[0]["nps_question"]+' <span class="project_name">';
if(O.texts["display_name"]){p.score_question+=O.texts["display_name"]
}else{if(O.texts["service_name"]){p.score_question+=O.texts["service_name"]
}else{Q.texts[0]["nps_this"]
}}p.score_question+="</span> "+Q.texts[0]["nps_question_1"];
p.score_low=Q.texts[0]["nps_not"]+" "+Q.texts[0]["nps_likely"];
p.score_high=Q.texts[0]["nps_extremely"]+" "+Q.texts[0]["nps_likely"];
p.feedback_question=Q.texts[0]["nps_why"];
p.email_title=O.texts["email_title"]||Q.texts[0]["nps_default_email_text"];
p.email_value=O.texts["email_value"]||"";
p.disclaimer=O.texts["disclaimer"]||Q.texts[0]["nokia_policy"];
p.submit=O.texts["submit"]||"Submit";
p.thankyou=O.texts["thanks"]||Q.texts[0]["nps_thanks"];
J()
})
};
var a=function(){var N=M(".nps_"+I.id).length;
v="npswidget_"+I.id+"_"+(N+1);
G=y()
};
var J=function(){c("beforeOpen");
if(I.render_overlay){M("BODY").append('<div id="'+u.render_id+'"> </div>')
}M("#"+I.render_id).html(B.wrapper());
B.update("vote");
if(I.render_overlay){M("BODY").append('<div class="nps_overlay nps-overlay-bg"> </div>');
M(".nps_overlay").show();
M("#"+v).addClass("npswidget_over").addClass("nps-overlay");
var N=M(document).width();
var O=M("#"+v).width();
M("#"+v).css("left",((N-O)/2)+"px")
}M("#"+v+" .npswidget_close").click(m);
M("#"+v+" .votecell A").click(L);
M("#"+v+" .votecell").mouseenter(function(P){M(this).addClass("votecell_hover")
}).mouseleave(function(P){M(this).removeClass("votecell_hover")
});
c("afterOpen");
C.create(A+"_rd",D(),365)
};
var L=function(N){N.preventDefault();
c("onVote");
M("#"+v+" .votecell SPAN").unbind();
g=N.target.innerHTML;
if(I.feedback_req!==true){b("recommend",{rec:N.target.innerHTML,idSuffix:j,lan:I.lang,XssHttpRequestVar:"XssHttpRequest1Loaded"})
}C.create(A+"_sd",D(),365);
z()
};
var b=function(S,N){var N=N||{};
var T=(I.qa_mode==true)?w:o;
var Q=T+"/nps-2.1/nps_widget/scripts/"+S+".php";
N.version="2.1";
N.projid=I.id;
N.pageurl=window.location.href;
N.nps_id=G;
var P=k();
var U=document.createElement("script");
var R=Q+"?";
var O;
for(O in N){if(N.hasOwnProperty(O)){R+=O+"="+N[O]+"&"
}}R=R.substring(0,R.length-1);
n("jsonp src = "+R);
U.src=R;
document.body.appendChild(U);
setTimeout(function(){document.body.removeChild(U)
},1500)
};
var z=function(){B.update("feedback");
M("#"+v+" .npswidget_feedback_submit_button").click(r)
};
var r=function(O){O.preventDefault();
var P=M("#"+v+"_text").val();
var N=M("#"+v+"_email").val();
c("onSubmit");
if(I.feedback_req===true){b("recommend",{rec:g,idSuffix:j,lan:I.lang,XssHttpRequestVar:"XssHttpRequest1Loaded"})
}b("feedback",{"fb-text":P,"fb-email":N,XssHttpRequestVar:"XssHttpRequest2Loaded"});
l()
};
var l=function(){B.update("thanks");
window.setTimeout(function(){m()
},(K*1000))
};
var d=function(){n("_determineOpen");
if(I.render_always===true){return true
}if(I.render_never===true){return true
}var O=D();
var N=C.read(A+"_v",1);
var P=C.read(A+"_sd",false);
var R=C.read(A+"_rd",false);
var Q=C.read(A+"_cd",false);
n("View: "+N+" | submit_date: "+P);
n("today: "+O+" | submit_date: "+P+" | close_date: "+Q+" | render_date: "+R);
if((I.render_submit!==false)&&(P!==false)){if((O-P)>=I.render_submit){return true
}else{n("Not showing because user has already voted. Delay not met ("+I.render_submit+" days).");
return false
}}if((I.render_close!==false)&&(Q!==false)){if((O-Q)>=I.render_close){return true
}else{n("Not showing because user has closed widget. Delay not met ("+I.render_close+" days).");
return false
}}if((I.render_abandon!==false)&&((R!==false))){if((O-R)>=I.render_abandon){return true
}else{n("Not showing because user has abandoned widget. Delay not met ("+I.render_abandon+" days).");
return false
}}if(parseInt(N)>=parseInt(I.render_interval)){return true
}n("Not showing because user has not viewed page enough times (keep refreshing!).");
C.create(A+"_v",parseInt(N)+1,365);
return false
};
var k=function(){function N(){return(((1+Math.random())*65536)|0).toString(16).substring(1)
}return(N()+N()+"-"+N()+"-"+N()+"-"+N()+"-"+N()+N()+N())
};
var C={create:function(P,Q,R){if(R){var O=new Date();
O.setTime(O.getTime()+(R*24*60*60*1000));
var N="; expires="+O.toGMTString()
}else{var N=""
}document.cookie=P+"="+Q+N+"; path=/"
},read:function(O,Q){var R=O+"=";
var N=document.cookie.split(";");
for(var P=0;
P<N.length;
P++){var S=N[P];
while(S.charAt(0)==" "){S=S.substring(1,S.length)
}if(S.indexOf(R)==0){return S.substring(R.length,S.length)
}}return Q
},erase:function(N){createCookie(N,"",-1)
}};
var q=function(N){if(u.debug){M("#nps_debug").append("ERROR: "+N+"<br/>")
}return false
};
var n=function(N){if(u.debug){M("#nps_debug").append(N+"<br/>")
}};
var c=function(N){if(I[N]&&(typeof I[N]=="function")){I[N](this)
}};
var B={update:function(N){if(N&&(typeof B[N]=="function")){M("#"+v+" .npswidget_content").html(B[N]())
}else{q("Could not update widget contents.")
}},wrapper:function(){var N='<div id="'+v+'" class="npswidget npswidget_'+I.id+'"><div class="npswidget_wrapper_top"><div class="npswidget_close"><a href="#" class="button"> </a></div></div><div class="npswidget_wrapper_middle npswidget_content"></div><div class="npswidget_wrapper_bottom"> </div></div>';
return N
},vote:function(){var P="";
var O=s[0]||0;
var N=s[1]||10;
P='<div class="npswidget_vote"><h4 class="npswidget_vote_question">'+p.score_question+'</h4><ul class="npswidget_vote_scale" style="margin-left:0px;">';
while(O<=N){P+='<li class="votecell n_'+O+'" style="margin-left:0px;"><a href="#" style="text-decoration:none;">'+O+"</a></li>";
O++
}P+='</ul><div class="npswidget_clear"> </div><div class="npswidget_vote_key"><div class="npswidget_vote_key_l"><span class="arrow">&lt;</span> '+p.score_low+'</div><div class="npswidget_vote_key_h">'+p.score_high+' <span class="arrow">&gt;</span></div></div></div>';
return P
},feedback:function(){var N=(I.change_email)?"":"READONLY";
var O='<div class="npswidget_feedback"><div class="npswidget_feedback_question"><h4>'+p.feedback_question+'</h4><div class="npswidget_feedback_question_field"><textarea id="'+v+'_text" name="fb-text"></textarea></div></div><div class="npswidget_feedback_email"><h4>'+p.email_title+'</h4><div class="npswidget_feedback_email_field"><input id="'+v+'_email" type="text" name="fb-email" '+N+' value="'+p.email_value+'" /></div></div><div class="npswidget_feedback_submit"><a href="#" class="npswidget_feedback_submit_button"><span>'+p.submit+'</span></a></div><div class="npswidget_feedback_disclaimer">'+p.disclaimer+"</div></div>";
return O
},thanks:function(){var N='<div class="npswidget_complete"><div class="npswidget_complete_message">'+p.thankyou+"</div></div>";
return N
}};
var D=function(){return Math.round(new Date().getTime()/1000/86400)
};
var m=function(N){if(N){N.preventDefault()
}c("beforeClose");
M("#"+v).fadeOut(1000,function(){M(this).remove()
});
c("afterClose");
if(I.render_overlay){M(".nps_overlay").fadeOut(1000,function(){M(this).remove()
})
}if(g==false){C.create(A+"_cd",D(),365)
}};
var H=function(N){var O=window.onload;
if(typeof window.onload!="function"){window.onload=N
}else{window.onload=function(){if(O){O()
}N()
}
}};
var y=function(){function X(ah){var ag="";
var ai=-1;
var af,aj;
while(++ai<ah.length){af=ah.charCodeAt(ai);
aj=ai+1<ah.length?ah.charCodeAt(ai+1):0;
if(55296<=af&&af<=56319&&56320<=aj&&aj<=57343){af=65536+((af&1023)<<10)+(aj&1023);
ai++
}if(af<=127){ag+=String.fromCharCode(af)
}else{if(af<=2047){ag+=String.fromCharCode(192|((af>>>6)&31),128|(af&63))
}else{if(af<=65535){ag+=String.fromCharCode(224|((af>>>12)&15),128|((af>>>6)&63),128|(af&63))
}else{if(af<=2097151){ag+=String.fromCharCode(240|((af>>>18)&7),128|((af>>>12)&63),128|((af>>>6)&63),128|(af&63))
}}}}}return ag
}function V(af){return ab(Q(U(af),af.length*8))
}function U(ag){var af=Array(ag.length>>2);
for(var ah=0;
ah<af.length;
ah++){af[ah]=0
}for(var ah=0;
ah<ag.length*8;
ah+=8){af[ah>>5]|=(ag.charCodeAt(ah/8)&255)<<(ah%32)
}return af
}function W(af){return ae(V(X(af)))
}function P(ak,ah,ag,af,aj,ai){return aa(ad(aa(aa(ah,ak),aa(af,ai)),aj),ag)
}function aa(af,ai){var ah=(af&65535)+(ai&65535);
var ag=(af>>16)+(ai>>16)+(ah>>16);
return(ag<<16)|(ah&65535)
}function ad(af,ag){return(af<<ag)|(af>>>(32-ag))
}function O(ah,ag,al,ak,af,aj,ai){return P((ag&al)|((~ag)&ak),ah,ag,af,aj,ai)
}function T(ah,ag,al,ak,af,aj,ai){return P((ag&ak)|(al&(~ak)),ah,ag,af,aj,ai)
}function Z(ah,ag,al,ak,af,aj,ai){return P(ag^al^ak,ah,ag,af,aj,ai)
}function N(ah,ag,al,ak,af,aj,ai){return P(al^(ag|(~ak)),ah,ag,af,aj,ai)
}function ae(ah){try{hexcase
}catch(ak){hexcase=0
}var aj=hexcase?"0123456789ABCDEF":"0123456789abcdef";
var ag="";
var af;
for(var ai=0;
ai<ah.length;
ai++){af=ah.charCodeAt(ai);
ag+=aj.charAt((af>>>4)&15)+aj.charAt(af&15)
}return ag
}function ab(ag){var af="";
for(var ah=0;
ah<ag.length*32;
ah+=8){af+=String.fromCharCode((ag[ah>>5]>>>(ah%32))&255)
}return af
}function Q(ap,ak){ap[ak>>5]|=128<<((ak)%32);
ap[(((ak+64)>>>9)<<4)+14]=ak;
var ao=1732584193;
var an=-271733879;
var am=-1732584194;
var al=271733878;
for(var ah=0;
ah<ap.length;
ah+=16){var aj=ao;
var ai=an;
var ag=am;
var af=al;
ao=O(ao,an,am,al,ap[ah+0],7,-680876936);
al=O(al,ao,an,am,ap[ah+1],12,-389564586);
am=O(am,al,ao,an,ap[ah+2],17,606105819);
an=O(an,am,al,ao,ap[ah+3],22,-1044525330);
ao=O(ao,an,am,al,ap[ah+4],7,-176418897);
al=O(al,ao,an,am,ap[ah+5],12,1200080426);
am=O(am,al,ao,an,ap[ah+6],17,-1473231341);
an=O(an,am,al,ao,ap[ah+7],22,-45705983);
ao=O(ao,an,am,al,ap[ah+8],7,1770035416);
al=O(al,ao,an,am,ap[ah+9],12,-1958414417);
am=O(am,al,ao,an,ap[ah+10],17,-42063);
an=O(an,am,al,ao,ap[ah+11],22,-1990404162);
ao=O(ao,an,am,al,ap[ah+12],7,1804603682);
al=O(al,ao,an,am,ap[ah+13],12,-40341101);
am=O(am,al,ao,an,ap[ah+14],17,-1502002290);
an=O(an,am,al,ao,ap[ah+15],22,1236535329);
ao=T(ao,an,am,al,ap[ah+1],5,-165796510);
al=T(al,ao,an,am,ap[ah+6],9,-1069501632);
am=T(am,al,ao,an,ap[ah+11],14,643717713);
an=T(an,am,al,ao,ap[ah+0],20,-373897302);
ao=T(ao,an,am,al,ap[ah+5],5,-701558691);
al=T(al,ao,an,am,ap[ah+10],9,38016083);
am=T(am,al,ao,an,ap[ah+15],14,-660478335);
an=T(an,am,al,ao,ap[ah+4],20,-405537848);
ao=T(ao,an,am,al,ap[ah+9],5,568446438);
al=T(al,ao,an,am,ap[ah+14],9,-1019803690);
am=T(am,al,ao,an,ap[ah+3],14,-187363961);
an=T(an,am,al,ao,ap[ah+8],20,1163531501);
ao=T(ao,an,am,al,ap[ah+13],5,-1444681467);
al=T(al,ao,an,am,ap[ah+2],9,-51403784);
am=T(am,al,ao,an,ap[ah+7],14,1735328473);
an=T(an,am,al,ao,ap[ah+12],20,-1926607734);
ao=Z(ao,an,am,al,ap[ah+5],4,-378558);
al=Z(al,ao,an,am,ap[ah+8],11,-2022574463);
am=Z(am,al,ao,an,ap[ah+11],16,1839030562);
an=Z(an,am,al,ao,ap[ah+14],23,-35309556);
ao=Z(ao,an,am,al,ap[ah+1],4,-1530992060);
al=Z(al,ao,an,am,ap[ah+4],11,1272893353);
am=Z(am,al,ao,an,ap[ah+7],16,-155497632);
an=Z(an,am,al,ao,ap[ah+10],23,-1094730640);
ao=Z(ao,an,am,al,ap[ah+13],4,681279174);
al=Z(al,ao,an,am,ap[ah+0],11,-358537222);
am=Z(am,al,ao,an,ap[ah+3],16,-722521979);
an=Z(an,am,al,ao,ap[ah+6],23,76029189);
ao=Z(ao,an,am,al,ap[ah+9],4,-640364487);
al=Z(al,ao,an,am,ap[ah+12],11,-421815835);
am=Z(am,al,ao,an,ap[ah+15],16,530742520);
an=Z(an,am,al,ao,ap[ah+2],23,-995338651);
ao=N(ao,an,am,al,ap[ah+0],6,-198630844);
al=N(al,ao,an,am,ap[ah+7],10,1126891415);
am=N(am,al,ao,an,ap[ah+14],15,-1416354905);
an=N(an,am,al,ao,ap[ah+5],21,-57434055);
ao=N(ao,an,am,al,ap[ah+12],6,1700485571);
al=N(al,ao,an,am,ap[ah+3],10,-1894986606);
am=N(am,al,ao,an,ap[ah+10],15,-1051523);
an=N(an,am,al,ao,ap[ah+1],21,-2054922799);
ao=N(ao,an,am,al,ap[ah+8],6,1873313359);
al=N(al,ao,an,am,ap[ah+15],10,-30611744);
am=N(am,al,ao,an,ap[ah+6],15,-1560198380);
an=N(an,am,al,ao,ap[ah+13],21,1309151649);
ao=N(ao,an,am,al,ap[ah+4],6,-145523070);
al=N(al,ao,an,am,ap[ah+11],10,-1120210379);
am=N(am,al,ao,an,ap[ah+2],15,718787259);
an=N(an,am,al,ao,ap[ah+9],21,-343485551);
ao=aa(ao,aj);
an=aa(an,ai);
am=aa(am,ag);
al=aa(al,af)
}return Array(ao,an,am,al)
}var ac=new Date().getTime();
var S="";
S=W(ac.toString());
var Y=S.length;
var R="";
for(i=0;
i<Y;
i++){R+=S.charAt(i);
if(i==8||i==12||i==16){R+="-"
}}return R
};
this.hide=function(){m()
};
F(u)
};


}
/*
     FILE ARCHIVED ON 08:16:30 Aug 04, 2011 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 16:47:06 Feb 21, 2025.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  captures_list: 0.654
  exclusion.robots: 0.02
  exclusion.robots.policy: 0.009
  esindex: 0.016
  cdx.remote: 16.388
  LoadShardBlock: 790.91 (3)
  PetaboxLoader3.datanode: 705.136 (4)
  PetaboxLoader3.resolve: 128.388 (2)
  load_resource: 160.69
*/