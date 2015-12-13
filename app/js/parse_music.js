 getMusicFromDir(MUSIC_DIR)
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

       //  console.log("dom ready!");
       for (var index in value) {
         //console.log(createTrackListingFromObject(value[index]));
         //var source = $("#album-grid").html();
         var template = Handlebars.compile($("#album-grid").html());
         console.log(value[index]);
         var albumInfo = {
           artist: value[index].artist,
           filetype: value[index].filetype,
           tracklist: createTrackListingFromObject(value[index]),
           image: value[index].art[3]["#text"],
           thumbnail: value[index].art[1]["#text"],
           album: value[index].album
         };
         var html = template(albumInfo);
         $('.grid').append(html);
       }
     });
   })
   .then(function() {
     // var wookmark = $('.grid').wookmark({
     //   // Prepare layout options.
     //   align: "center",
     //   autoResize: true, // This will auto-update the layout when the browser window is resized.
     //   offset: 20, // Optional, the distance between grid items
     //   outerOffset: 10, // Optional, the distance to the containers border
     //   itemWidth: 250, // Optional, the width of a grid item
     //   verticalOffset: 20,
     //   resizeDelay: 10,
     //   flexibleWidth: true
     // });
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
     setTimeout(function() {
       $("#loading-gif").fadeOut(1000, function() {
         $('#loading-gif').remove();
         $('#loading-text').animate({
           marginTop: $(window).height() / 2 + "px"
         }, 500, function() {
           $('#loading-text').fadeOut(500, function(){
             $('#loading-text').text("Lets go");
             $('#loading-text').fadeIn(500,function(){
               $('#loading-text').fadeOut(500, function(){
                 $('#loading-icon').fadeOut(500, function(){
                   $('#loading-icon').remove();
                 });
               });
             });
           });
         });
       });
     }, 500);
     // $('#loading-icon').remove();
     console.log("all done!");
   });
