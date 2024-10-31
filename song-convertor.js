const SpotifyWebApi = require('spotify-web-api-node');
const { google } = require('googleapis');

// spotify api
const spotifyApi = new SpotifyWebApi({
  clientId: '',
  clientSecret: '',
});

// 
async function authenticateSpotify() {
  const data = await spotifyApi.clientCredentialsGrant();
  spotifyApi.setAccessToken(data.body['access_token']);
}

// import playlists
async function getSpotifyTracks(playlistId) {
  await authenticateSpotify();
  const data = await spotifyApi.getPlaylistTracks(playlistId);
  return data.body.items.map(item => ({
    name: item.track.name,
    artist: item.track.artists[0].name
  }));
}

// youtube api
const youtube = google.youtube({
  version: 'v3',
  auth: '' 
});

//search track on youtub e
async function searchYouTube(track) {
  const res = await youtube.search.list({
    part: 'snippet',
    q: `${track.name} ${track.artist}`,
    maxResults: 1,
    type: 'video'
  });
  return res.data.items[0]?.id?.videoId || null;
}


async function createYouTubePlaylist(authClient) {
  const res = await youtube.playlists.insert({
    part: 'snippet,status',
    auth: authClient,
    requestBody: {
      snippet: {
        title: 'Converted Spotify Playlist',
        description: 'Playlist converted from Spotify'
      },
      status: {
        privacyStatus: 'public'
      }
    }
  });
  return res.data.id;
}


async function addVideoToPlaylist(authClient, playlistId, videoId) {
  await youtube.playlistItems.insert({
    part: 'snippet',
    auth: authClient,
    requestBody: {
      snippet: {
        playlistId: playlistId,
        resourceId: {
          videoId: videoId,
          kind: 'youtube#video'
        }
      }
    }
  });
}


async function spotifyToYouTube(spotifyPlaylistId, authClient) {
  const tracks = await getSpotifyTracks(spotifyPlaylistId);
  const youtubePlaylistId = await createYouTubePlaylist(authClient);

  for (const track of tracks) {
    const videoId = await searchYouTube(track);
    if (videoId) {
      await addVideoToPlaylist(authClient, youtubePlaylistId, videoId);
      console.log(`Added ${track.name} by ${track.artist} to YouTube playlist.`);
    } else {
      console.log(`Could not find ${track.name} by ${track.artist} on YouTube.`);
    }
  }
}


