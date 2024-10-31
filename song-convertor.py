import requests

#define api keys
spotify_token = 'SPOTIFY_TOKEN'
youtube_api_key = 'YOUTUBE_API_KEY'



def get_spotify_tracks(playlist_id):
    url = f"https://api.spotify.com/v1/playlists/{playlist_id}/tracks"
    headers = {
        "Authorization": f"Bearer {spotify_token}"
    }
    response = requests.get(url, headers=headers)
    tracks = response.json()['items']
    
    track_list = []
    for item in tracks:
        track_name = item['track']['name']
        artist_name = item['track']['artists'][0]['name']
        track_list.append(f"{track_name} {artist_name}")
    return track_list


def search_youtube(track_name):
    url = f"https://www.googleapis.com/youtube/v3/search?part=snippet&q={track_name}&key={youtube_api_key}&type=video"
    response = requests.get(url)
    items = response.json().get("items", [])
    if items:
        return items[0]["id"]["videoId"]
    return None


def create_youtube_playlist():
   
    pass


def spotify_to_youtube(spotify_playlist_id):
    track_list = get_spotify_tracks(spotify_playlist_id)
    youtube_links = []
    
    for track in track_list:
        video_id = search_youtube(track)
        if video_id:
            youtube_links.append(f"https://www.youtube.com/watch?v={video_id}")
    
 

    return youtube_links


