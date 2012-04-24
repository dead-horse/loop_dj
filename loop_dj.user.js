// ==UserScript==  
// @name         loop DJ
// @version      0.0.1
// @author       heyiyu.deadhorse@gmail.com
// @namespace    https://github.com/dead-horse
// @description  loop DJ
// @include      *://loop.xiami.com/room/*
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
  jQuery.cookie = function(name, value, options) {
    if (typeof value != 'undefined') { // name and value given, set cookie
      options = options || {};
      if (value === null) {
        value = '';
        options.expires = -1;
      }
      var expires = '';
      if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
        var date;
        if (typeof options.expires == 'number') {
          date = new Date();
          date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
        } else {
          date = options.expires;
        }
        expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
      }
      // CAUTION: Needed to parenthesize options.path and options.domain
      // in the following expressions, otherwise they evaluate to undefined
      // in the packed version for some reason...
      var path = options.path ? '; path=' + (options.path) : '';
      var domain = options.domain ? '; domain=' + (options.domain) : '';
      var secure = options.secure ? '; secure' : '';
      document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { // only name given, get cookie
      var cookieValue = null;
      if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
          var cookie = jQuery.trim(cookies[i]);
          // Does this cookie string begin with the name we want?
          if (cookie.substring(0, name.length + 1) == (name + '=')) {
            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
            break;
          }
        }
      }
      return cookieValue;
    }
  };
  var needDJ = false;
  var timer = null;
  //开关
  $('<li class="fence">').appendTo($('#nav'));
  $('<li><a id="need_dj" hrf="javascript:void(0);">抢DJ</a></li>')
  .appendTo($('#nav'));
  $('.test').click(function() {
    var a = $(this);
    if (a.html() === '抢DJ') {
      needDJ = true;
      a.html('停止');
      timer = setInterval(tryDj, 100);
    } else {
      needDJ = false;
      a.html('抢DJ');
      clearInterval(timer);
    }
  });
  
  var tryDj = function() {
    for(var i in room.DJ){
      if(room.DJ[i] && room.DJ[i].user_id==uid) {
        $('#need_dj').click();
        return;
      }
    }
    if ($('.dj_waiting a').length !== 0) {
      socket.emit(PubType.SetDJ, {user_id:uid, nick_name:nick_name, room_id:roomId, code:$.cookie('member_auth')},
      function(err){
    	  if(err) console.log(err);
    	 });
    }
  }
  //离开提示
  window.onbeforeunload = function(e) {
   var e = window.event || e;
    for(var i in room.DJ){
      if(room.DJ[i] && room.DJ[i].user_id === uid) {
        if (!confirm('你正在DJ中，确定要离开吗？')) {
          return false;
        }
      }
    }
  }
}, true);
