# YouDown REST

`YouDown REST` is a small python's REST service for downloading a youtube videos. The service required python 3.7 or above. The service uses [pytube](https://pypi.org/project/pytube/) and [Flask](https://flask.palletsprojects.com/en/2.2.x/) python libraries.


## Dependency installation

```bash
pip install -r requirments.txt
```

## Run server

```bash
python3 main.py
```

## REST endpoints

### `/streams`

The `/streams` endpoint receives as an argument JSON with an `url` parameter referring to a YouTube video, for example:

```json
{
	'url': 'https://www.youtube.com/watch?v=_3EuiU1qdpE'
}
```

The response will be **an array** of JSON objects, each represent available video stream, and has the following fields:

- `itag` - iTag number (stream identification number)
- `res` - Video resolution
- `mime_type` - MIME type
- `fps` - FPS (or empty string)
- `bitrate` - Bitrate, bps
- `acodec` - Audio codec name
- `vcodec` - Video codecs
- `progressive` - `True` if progressive coding was used, otherwise `False`
- `file_size` - File size in bytes
- `title` - Video title
- `type` - Stream type (?)


### `/download/XXX`

The `/download/XXX` endpoint is a link for downloading a video stream, for which was previously the request `/streams` made. The `XXX` in the link is a `iTag` value of selected stream. This link can be used in the `<a>` element, for example:

```html
<a src="/download/1">Download stream #1</a>
<a src="/download/2">Download stream #2</a>
...
```

Repository was successfully forked!