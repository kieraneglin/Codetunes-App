// window.$ = window.jQuery = require('jquery');
$(document).ready(function() {
  // alert("Dom Loaded");
  getMusicFromDir(MUSIC_DIR)
    .then(function(value) {
       console.log("getMusicFromDir");
      if (value === true) {
        return true;
      } else {
        //debugger
        return fileInfo(value);
      }
    })
    .then(function(value) {
      //alert("fileinfo");
      console.log("Fileinfo ran");

      // Create albums from tracks
      if (value === true) {
        return true;
      } else {
        //debugger
        return buildAlbumsFromSongs(value);
      }
    })
    .then(function(value) {
      // alert("build albums");
      console.log("album form songs ran ");

      // Run this into or API to grab any missing info
      if (value === true) {
        console.log("stopping");
        return true;
      } else {
        console.log("1: ", value);
        return albumInfo(value);
      }
    })
    .then(function(value) {

      return new Promise(function(resolve) {
        if (value === true) {
          console.log("ran");
          if (fs.existsSync(TEMP_DIR + "final-object.json")) {
            fs.readFile(TEMP_DIR + "final-object.json", 'utf8', function(err, contents) {
              value = JSON.parse(contents);
              window.fromCache = true;
              resolve(value);
            });
          }

        } else {
          writeInfoToFiles(value, "final-object.json");
          window.fromCache = false;
          resolve(value);
        }
      });
    })
    .then(function(value) {
      var ordered = {};
      Object.keys(value).sort().forEach(function(key) {
        ordered[key] = value[key];
      });
      value = ordered;
      //  console.log("dom ready!");
      for (var index in value) {
        var template = Handlebars.compile($("#album-grid").html());
        //console.log(value[index]);
        //  debugger
        var albumInfo = {
          artist: value[index].artist,
          filetype: value[index].filetype,
          tracklist: createTrackListingFromObject(value[index]),
          // tracklist: value[index].songs,
          image: value[index].art[3]["#text"],
          thumbnail: value[index].art[1]["#text"],
          album: value[index].album
        };
        var html = template(albumInfo);
        $('.grid').append(html);
      }
    })
    .then(function() {



      var wall = new freewall('.grid');
      wall.reset({
        selector: '.flip-container',
        animate: true,
        cellH: 40,
        fixSize: 1,
        onResize: function() {
          wall.fitWidth();
        },
      });

      wall.fitWidth();
      if (window.fromCache === false) {
      //  $('#loading-text').text("Analyzing your music");
        setTimeout(function() {
          $("#loading-gif").fadeOut(1000, function() {
            $('#loading-gif').remove();
            $('#loading-text').animate({
              marginTop: $(window).height() / 2 + "px"
            }, 500, function() {
              $('#loading-text').fadeOut(500, function() {
                $('#loading-text').text("Lets go");
                $('#loading-text').fadeIn(500, function() {
                  $('#loading-text').fadeOut(500, function() {
                    $('#loading-icon').fadeOut(500, function() {
                      $('#loading-icon').remove();
                    });
                  });
                });
              });
            });
          });
        }, 500);
      } else {
        $('#loading-gif').remove();
        setTimeout(function() {
          $('#loading-icon').fadeOut(200, function() {
            $('#loading-icon').remove();
          });
        }, 300);
      }
      // $('#loading-icon').remove();
      console.log("all done!");

    }).catch(function(reason) {
      console.log(reason);
    });
});
