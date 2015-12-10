var request = require('request');
var fs = require('fs');
var mm = require('musicmetadata');
var prettyjson = require('prettyjson');
var homedir = require('homedir');


const MUSIC_DIR = process.env.HOME + "/Music/test/";

function buildSong(metadata) {
    return {
        artist: metadata.artist[0],
        album: metadata.album
    };
}

function albumInfo(songCollection) {
    return new Promise(function(resolve) {
        result = [];
        songCollection.forEach(function(song) {
            var urlSafeArtist = song.artist.replace(/ /g, '+');
            var urlSafeAlbum = song.album.replace(/ /g, '+');
            var url = 'http://warm-cove-9628.herokuapp.com/album/' + urlSafeAlbum + '/artist/' + urlSafeArtist;

            request(url, function(error, response, body) {
                console.log(url);

                if (!error && (response.statusCode == 200)) {
                    result.push(JSON.parse(body));
                } else {
                    console.log(error);
                }

                if (result.length >= songCollection.length) {
                    resolve(result);
                }
            });
        });
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
                    buildSongCollection(resolve, result, buildSong(metadata), files.length);
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


getMP3sFromDir(MUSIC_DIR)
    .then(function(value) {
        return fileInfo(value);
    })
    .then(function(value) {
        return albumInfo(value);
    })
    .then(function(value) {
        console.log(value);
        $(document).ready(function() {
            console.log("dom ready!");
            value.forEach(function(song) {
                $('.flipper').append('<li class="image-preload">' +
                    '<img height="500" width="500" src=' + song.album.image[4]["#text"] + '>' +
                    '<h3>' + song.album.artist + '</h3>' +
                    song.album.name + '</li>');
            });
        });
    })
    .then(function() {
        $('.flip').flipster({
            fadeIn: 300,
            start: 0
        });
        console.log("all done!");
    });

$(document).ready(function() {
    // Setting that intial state
    $('#main-window').width($(document).width());
    $(window).resize(function() {
        $('#main-window').width($(document).width());
    });

});