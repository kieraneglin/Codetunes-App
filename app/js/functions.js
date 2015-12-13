var request = require('request');
var fs = require('fs');
var mm = require('musicmetadata');
var pj = require('prettyjson');
var homedir = require('homedir');
var Handlebars = require('handlebars');
var path = require('path');

var MUSIC_DIR = process.env.HOME + "/Music/test/";

function buildSong(metadata, filepath) {
  return {
    filetype: filepath.substr((filepath.lastIndexOf('.') + 1)),
    title: metadata.title,
    filepath: filepath,
    artist: metadata.artist[0],
    album: metadata.album
  };
}


var sendServerRequest = function(url, index, songCollection, result, resolve) {
  request(url, function(error, response, body) {
    //console.log(url);
    var i = 0;
    if (!error && (response.statusCode == 200)) {
      response = JSON.parse(body);

      songCollection[index].album = response.album.name;
      songCollection[index].art = response.album.image;
      songCollection[index].artist = response.album.artist;
      songCollection[index].tags = response.album.tags;
      songCollection[index].wiki = response.album.wiki;

      expectedLength = Object.keys(songCollection).length;
      result.push(index);
      //console.log(result);

    } else {
      console.log(error);
    }

    if (result.length >= expectedLength) {
      resolve(songCollection);
    }
  });
};

function albumInfo(songCollection) {
  return new Promise(function(resolve) {
    //console.log(songCollection);

    result = [];
    for (var index in songCollection) {

      var urlSafeArtist = songCollection[index][0].artist.replace(/ /g, '+');
      var urlSafeAlbum = index.replace(/ /g, '+');
      var url = 'http://warm-cove-9628.herokuapp.com/album/' + urlSafeAlbum +
        '/artist/' + urlSafeArtist;
      //console.log(url);

      sendServerRequest(url, index, songCollection, result, resolve);
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
      resolve(final);
    });
  });
}

function buildAlbumsFromSongs(songList) {
  return new Promise(function(resolve) {
    var groupedSongs = {};

    songList.forEach(function(song) {
      groupedSongs[song.album] = groupedSongs[song.album] || [];
      groupedSongs[song.album].push({
        filetype: song.filetype,
        title: song.title,
        filepath: song.filepath,
        artist: song.artist
      });
    });
    resolve(groupedSongs);
  });
}

function createTrackListingFromObject(object) {
  var result = {};
  for (var index in object) {
    if ($.isNumeric(index)) {
      result[index] = [];
      //console.log("LISTEN", object[index]);
      result[index].push({
        filetype: object[index].filetype,
        title: object[index].title,
        filepath: object[index].filepath
      });
    }
  }
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
