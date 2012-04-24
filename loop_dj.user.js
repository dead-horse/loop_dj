// ==UserScript==  
// @name         loop DJ
// @version      0.0.1
// @author       heyiyu.deadhorse@gmail.com
// @namespace    https://github.com/dead-horse
// @description  loop DJ
// @include      *://loop.xiami.com/room/*
// ==/UserScript==

console.log(uid);
var needDJ = false;
var timer = null;
//开关
$('<li class="fence">').appendTo($('#nav'));
$('<li><a id="need_dj" hrf="javascript:void(0);" class="test">抢DJ</a></li>')
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
  console.log('try');
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
$('.test').click();
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
