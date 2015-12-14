// window.$ = window.jQuery = require('jquery');
// alert("player");
function makePlaylistItem(song) {
  return {
    title: song.title,
    artist: song.artist,
    mp3: song.filepath,
    poster: song.thumbnail
  };

}

$(document).ready(function() {


  // echo.render(); is also available for non-scroll callbacks

  setTimeout(function() {
    $("#loading-gif").fadeIn(1700);
    $("#loading-text").fadeIn(1500);
  }, 500);


  jQuery("#jquery_jplayer_1").bind(jQuery.jPlayer.event.loadeddata, function(event) {
    var current = myPlaylist.current,
      playlist = myPlaylist.playlist;
    jQuery.each(playlist, function(index, obj) {
      if (index == current) {
        //  console.log(obj);
        $('.jp-current-artist').text(obj.artist);
        $('.jp-current-song').text(obj.title);
        $('.jp-time-holder').show();
      } // if condition end
    });
  });

  // $('body').on('click', '.flip-container', function(){
  //   $(this).addClass('hover');
  //   $(this).hover('out', function(){
  //     $(this).removeClass('hover');
  //   });
  // });
  // $('#loading-icon').width($(window).width());
  // $('#loading-icon').height($(window).height());

  $('.jp-sidebar-toggle').click(function() {
    $('#jp_container_1').toggleClass('sidebar-open sidebar-closed');
    $('#main-window').toggleClass('sidebar-open sidebar-closed');
    $('.sidebar').toggleClass('hide-sidebar');
    $('.jp-playlist').fadeToggle(100);

    // Oh god why - super bad hack to make the layout resize
    setTimeout(function() {
      window.resizeBy(-1, -1);
      window.resizeBy(1, 1);
    }, 500);

    //  window.resizeBy(windowWidth,windowHeight);

  });
  var myPlaylist = new jPlayerPlaylist({
    jPlayer: "#jquery_jplayer_1",
    cssSelectorAncestor: "#jp_container_1"
  }, [

  ], {
    wmode: "window",
    supplied: "m4a, mp3",
    size: {
      width: "64px",
      height: "64px"
    },
    useStateClassSkin: true,
    autoBlur: false,
    smoothPlayBar: true,
    keyEnabled: true
  });

  var thing = {
    title: "test",
    mp3: MUSIC_DIR + "vicarious.mp3"
  };
  //myPlaylist;
  $('body').on("click", ".jp-playlist-item-remove", function() {
    //console.log(makePlaylistItem($(this).data()));
    setTimeout(function() {
      test = myPlaylist;
      if (test.playlist.length == 1) {
        setTimeout(function() {
          $('.jp-current-artist').text("");
          $('.jp-current-song').text("");
          $('.jp-time-holder').hide();
        }, 100);

      }
    }, 100);

  });
  $('body').on("click", ".song", function() {
    //console.log(makePlaylistItem($(this).data()));
    //console.log(myPlaylist);
    myPlaylist.add(makePlaylistItem($(this).data()));
  });

});
