var request = require('request');
var fs = require('fs');
var mm = require('musicmetadata');
var prettyjson = require('prettyjson');
var homedir = require('homedir');
var Handlebars = require('handlebars');

const MUSIC_DIR = process.env.HOME + "/Music/test/";

function buildSong(metadata, filepath) {
  return {
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
}

function albumInfo(songCollection) {
  return new Promise(function(resolve) {
    console.log(songCollection);

    result = [];
    for (var index in songCollection) {

      var urlSafeArtist = songCollection[index][0].artist.replace(/ /g, '+');
      var urlSafeAlbum = index.replace(/ /g, '+');
      var url = 'http://warm-cove-9628.herokuapp.com/album/' + urlSafeAlbum +
        '/artist/' + urlSafeArtist;
      console.log(url);

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


function getMP3sFromDir(dir) {
  return new Promise(function(resolve) {
    var files = fs.readdirSync(dir);
    var final = [];
    for (var i = 0; i < files.length; i++) {
      var extension = files[i].substr((files[i].lastIndexOf('.') + 1));
      if (extension == 'mp3') {
        final.push(MUSIC_DIR + files[i]);
      }
    }
    resolve(final);
  });
}

function buildAlbumsFromSongs(songList) {
  return new Promise(function(resolve) {
    var groupedSongs = {};

    songList.forEach(function(song) {
      groupedSongs[song.album] = groupedSongs[song.album] || [];
      groupedSongs[song.album].push({
        title: song.title,
        filepath: song.filepath,
        artist: song.artist
      });
    });
    resolve(groupedSongs);
  });
}
function createSongListingFromObject(object){

}
