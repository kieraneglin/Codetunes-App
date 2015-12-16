// window.$ = window.jQuery = require('jquery');
// alert("functions files ran");

var request = require('request');
var fs = require('fs');
var mm = require('musicmetadata');
var pj = require('prettyjson');
// var homedir = require('homedir');
var Handlebars = require('handlebars');
var path = require('path');
var app = require('electron').remote.app;

// alert("passed requires");

var MUSIC_DIR = process.env.HOME + "/Music/";
var TEMP_DIR = app.getPath("temp");

//alert(process.env.HOME + "/Music/");
function buildSong(metadata, filepath) {
  // debugger
  if (metadata.title === "" || metadata.title === undefined) {
    metadata.title = "unknown";
  }
  if (metadata.artist[0] === "" || metadata.artist[0] === undefined) {
    metadata.artist[0] = "unknown";
  }
  if (metadata.album === "" || metadata.album === undefined) {
    metadata.album = "unknown";
  }
  //debugger
  console.log("Meta: ", metadata);

  return {
    filetype: filepath.substr((filepath.lastIndexOf('.') + 1)),
    title: metadata.title,
    filepath: filepath,
    artist: metadata.artist[0],
    album: metadata.album
  };

}


var sendServerRequest = function(url, index, songCollection, result, resolve, album, artist) {
  request(url, function(error, response, body) {
    //  console.log(url);

    var i = 0;
    if (album !== "unknown" && artist !== "unknown") {
      if (!error && (response.statusCode == 200)) {
        response = JSON.parse(body);
        //  console.log(response);
        if (response.error == 6) {
          songCollection[index].artist = artist;
          songCollection[index].album = album;
          songCollection[index].art = [0, {
            "#text": "./assets/default-art-thumb.png"
          }, 2, {
            "#text": "./assets/default-art.png"
          }];
          songCollection[index].tags = "unknown tags";
          songCollection[index].wiki = "unknown wiki";
          expectedLength = Object.keys(songCollection).length;
          result.push(index);
        } else {
          if (response.album.image[3]["#text"] === "") {
            response.album.image = [0, {
              "#text": "./assets/default-art-thumb.png"
            }, 2, {
              "#text": "./assets/default-art.png"
            }];
          }

          //console.log(response);
          songCollection[index].album = response.album.name;
          songCollection[index].art = response.album.image;
          songCollection[index].artist = response.album.artist;
          songCollection[index].tags = response.album.tags;
          songCollection[index].wiki = response.album.wiki;

          expectedLength = Object.keys(songCollection).length;
          result.push(index);
          //console.log(result);
        }
      } else {
        console.log(error);
      }
    } else {
      //console.log(songCollection);
      if (album !== "unknown") {
        songCollection[index].album = album;
      } else {
        songCollection[index].album = artist;
      }
      if (artist !== "unknown") {
        songCollection[index].artist = artist;
      } else {
        songCollection[index].artist = "Unknown artist";
      }
      songCollection[index].art = [0, {
        "#text": "./assets/default-art-thumb.png"
      }, 2, {
        "#text": "./assets/default-art.png"
      }];
      songCollection[index].tags = "unknown tags";
      songCollection[index].wiki = "unknown wiki";
      expectedLength = Object.keys(songCollection).length;
      result.push(index);
    }
    //console.log(songCollection);
    if (result.length >= expectedLength) {
      console.log(JSON.stringify(songCollection));
      console.log(songCollection);
      resolve(songCollection);
    }
  });
};

function albumInfo(songCollection) {
  return new Promise(function(resolve) {
    //console.log(songCollection);

    result = [];
    for (var index in songCollection) {
      //console.log(songCollection);
      var artist = songCollection[index].songs[0].artist;
      var album = index;
      var urlSafeArtist = artist.replace(/[^\w\s]/gi, '');
      urlSafeArtist = urlSafeArtist.replace(/ /g, '+');
      var urlSafeAlbum = album.replace(/[^\w\s]/gi, '');
      urlSafeAlbum = urlSafeAlbum.replace(/ /g, '+');

      var url = 'http://warm-cove-9628.herokuapp.com/album/' + urlSafeAlbum +
        '/artist/' + urlSafeArtist;
      //console.log(url);

      sendServerRequest(url, index, songCollection, result, resolve, album, artist);

    }
  });
}

function fileInfo(files) {
  return new Promise(function(resolve, reject) {
    var result = [];
    files.forEach(function(file) {
      mm(fs.createReadStream(file), function(err, metadata) {
        if (err) {
          console.log(err);
        } else {
          buildSongCollection(resolve, result, buildSong(metadata, file), files.length);
        }
      });
    });
  });
}

function buildSongCollection(resolve, result, currentResult, requiredTotal) {
  result.push(currentResult);
  if (result.length >= requiredTotal) {
    resolve(result);
  }
}

function writeInfoToFiles(info, path) {
  path = TEMP_DIR + path;
  //console.log(path);
  fs.writeFile(
    path,
    JSON.stringify(info),
    function(err) {
      if (err) {
        console.error('File could not be saved ', err);
      } else {
        console.log("File saved", path);
      }
    }
  );
}

function arraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length)
    return false;
  for (var i = arr1.length; i--;) {
    if (arr1[i] !== arr2[i])
      return false;
  }

  return true;
}

function getMusicFromDir(dir) {
  return new Promise(function(resolve) {
    walk(MUSIC_DIR, function(err, results) {
      if (err) throw err;
      var files = results;
      var final = [];
      for (var i = 0; i < files.length; i++) {
        var extension = files[i].substr((files[i].lastIndexOf('.') + 1));
        if (extension == 'mp3' || extension == 'm4a') {
          final.push(files[i]);
        }
      }
      if (fs.existsSync(TEMP_DIR + "songlist.json")) {
        fs.readFile(TEMP_DIR + "songlist.json", 'utf8', function(err, contents) {
          //console.log(JSON.parse(contents));
          //console.log(final);
          if (arraysEqual(JSON.parse(contents), final.sort())) {
            // The songlist we have before is identical
            console.log("they match");
            resolve(true);
          } else {
            console.log("else");
            writeInfoToFiles(final.sort(), "songlist.json");
            resolve(final);
          }
        });
      } else {
        console.log("not running");
        writeInfoToFiles(final.sort(), "songlist.json");
        resolve(final);
      }
      //resolve(final);
    });
  });
}

function buildAlbumsFromSongs(songList) {
  return new Promise(function(resolve) {
    var groupedSongs = {};

    songList.forEach(function(song) {
      groupedSongs[song.album] = groupedSongs[song.album] || {};
      groupedSongs[song.album].songs = groupedSongs[song.album].songs || [];
      //groupedSongs[song.album]);
      groupedSongs[song.album].songs.push({
        filetype: song.filetype,
        title: song.title,
        filepath: song.filepath,
        artist: song.artist
      });
    });
    //debugger
    resolve(groupedSongs);
  });
}

function createTrackListingFromObject(object) {

  var result = {};
  songs = object.songs;
  songs.forEach(function(song, index) {
    //debugger;
    result[index] = [];
    //console.log("LISTEN", object[index]);
    result[index].push({
      filetype: song.filetype,
      title: song.title,
      filepath: song.filepath
    });
  });

  return result;
}

var walk = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

function updateSource(source, src) {
  source = $(source);
  source.attr("src", src).appendTo(source.parent());
}

function sortObject(obj) {
  var arr = [];
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      arr.push({
        'key': prop,
        'value': obj[prop]
      });
    }
  }
  arr.sort(function(a, b) {
    return a.value - b.value;
  });
  //arr.sort(function(a, b) { a.value.toLowerCase().localeCompare(b.value.toLowerCase()); }); //use this to sort as strings
  return arr; // returns array
}
