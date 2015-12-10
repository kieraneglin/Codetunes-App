getMP3sFromDir(MUSIC_DIR)
  .then(function(value) {
    // Grab ID3 Info from MP3
    return fileInfo(value);
  })
  .then(function(value) {
    // Create albums from tracks
    return buildAlbumsFromSongs(value);
  })
  .then(function(value) {
    // Run this into or API to grab any missing info
    return albumInfo(value);
  })
  .then(function(value) {
  //  console.log(value);
    $(document).ready(function() {
      console.log("dom ready!");
      for (var index in value) {
        console.log(value[index]);
        var source = $("#album-grid").html();
        var template = Handlebars.compile(source);
        var albumInfo = {
          image: value[index].art[3]["#text"],
          album: value[index].album
        };
        var html = template(albumInfo);
        $('.grid').append(html);
      }
    });
  })
  .then(function() {
    var wookmark = $('.grid').wookmark({
      // Prepare layout options.
      autoResize: true, // This will auto-update the layout when the browser window is resized.
      offset: 20, // Optional, the distance between grid items
      outerOffset: 10, // Optional, the distance to the containers border
      itemWidth: 250, // Optional, the width of a grid item
      verticalOffset: 20
    });

    console.log("all done!");
  });

$(document).ready(function() {


});
