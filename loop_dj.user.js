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
  var djTimer = null;
  var goodTimer = null;
  var sID = '';
  //开关
  $('<li class="fence">').appendTo($('#nav'));
  $('<li><a id="need_dj" href="javascript:void(0);">抢DJ</a></li>')
  .appendTo($('#nav'));
  $('<li><a id="auto_good" href="javascript:void(0);">自动摇头</a></li>')
  .appendTo($('#nav'));
  $('#need_dj').click(function() {
    var a = $(this);
    if (a.html() === '抢DJ') {
      a.html('停止');
      djTimer = setInterval(tryDj, 100);
    } else {
      a.html('抢DJ');
      clearInterval(djTimer);
    }
  });
  $('#auto_good').click(function() {
    var a = $(this);
    if (a.html() === '自动摇头') {
      a.html('停止摇头')
      autoGood();
      goodTimer = setInterval(autoGood, 1000 * 60);
    } else {
      a.html('自动摇头');
      clearInterval(goodTimer);
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

  var autoGood = function() {
    if (sound.curSong.sID !== sID) {
      sID = sound.curSong.sID;
      room.goodOrBad(1);
    }
  } 

  window.modifyLoopAvatar = function (id) {
    $("#div_popup .popup").hide();
  	if($("#bg_mask").size()<1) $('body').prepend('<div id="bg_mask"></div>');
  	$("#popup_loopAvatar").empty();
  	$.post('/loop/loopavatar',{id:id},function(data) {
      console.log('12345');
      console.log(data);
  		$("#popup_loopAvatar").html(data).show();
  		$('#popup_loopAvatar .close').click(function(){
  			$("#bg_mask").remove();
  			$('#popup_loopAvatar').hide();
  		});
  	});
  }
}, true);