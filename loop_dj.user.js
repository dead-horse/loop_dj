// ==UserScript==  
// @name         loop DJ
// @version      0.0.1
// @author       heyiyu.deadhorse@gmail.com
// @namespace    https://github.com/dead-horse
// @description  loop DJ
// @include      *://loop.xiami.com/room/*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js
// ==/UserScript==


function withjQuery(callback, safe){
  if(typeof(jQuery) == "undefined") {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js";

    if(safe) {
      var cb = document.createElement("script");
      cb.type = "text/javascript";
      cb.textContent = "jQuery.noConflict();(" + callback.toString() + ")(jQuery, window);";
      script.addEventListener('load', function() {
        document.head.appendChild(cb);
      });
    }
    else {
      var dollar = undefined;
      if(typeof($) != "undefined") dollar = $;
      script.addEventListener('load', function() {
        jQuery.noConflict();
        $ = dollar;
        callback(jQuery, window);
      });
    }
    document.head.appendChild(script);
  } else {
    setTimeout(function() {
      //Firefox supports
      callback(jQuery, typeof unsafeWindow === "undefined" ? window : unsafeWindow);
    }, 30);
  }
}

withjQuery(function($, window) {
  console.log(uid);
  var needDJ = false;
  var timer = null;
  //开关
  $('<li class="fence">').appendTo($('#nav'));
  $('<li><a id="need_dj">抢DJ</a></li>')
  .appendTo($('#nav'))
  .click(function() {
    var li = $(this);
    if (li.html() === '抢DJ') {
      needDJ = true;
      li.html('停止');
      timer = setInterval(tryDj, 100);
    } else {
      needDJ = false;
      li.html('抢DJ');
      clearInterval(timer);
    }
  });

  var tryDj = function() {
    console.log('try');
    for(var i in room.DJ){
      if(room.DJ[i] && room.DJ[i].user_id==uid) {
        $('#need_dj').click();
        return;
      }
    }
    console.log('still not');
    console.log($('.dj_waiting a'));
    $('.dj_waiting a') ? $('.dj_waiting a').click() : null;
  }

  //离开提示
  window.onbeforeunload = function(e) {
   var e = window.event || e;
    for(var i in room.DJ){
      if(room.DJ[i] && room.DJ[i].user_id==uid) {
        console.log('dj!');
        e.returnValue = '你正在DJ中，确定要离开吗？'
      }
    }
  }
}, true);
