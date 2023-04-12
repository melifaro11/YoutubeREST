# -*- coding: utf-8 -*-
import os
import logging
import secrets

from flask import Flask
from flask import session, request, jsonify, redirect, url_for
from flask import after_this_request, send_file, render_template

from werkzeug.serving import run_simple
from pytube import YouTube

#print ('run')
# Initialize logger
#logging.basicConfig(filename="youdown.log", level=logging.DEBUG)

# Initialize flask app
#logging.info("Starting flask app...")
app = Flask(__name__)
app.secret_key = secrets.token_urlsafe(32)


def handle_exception():
    """
    Decorator that handles call exception and returns jsonifyed response
    with an exception's message at 'error' key
    """
    def inner(func):
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except Exception as ex:
                return jsonify({
                    'error': f'{func.__name__}() exception: {ex}'
                })

        wrapper.__name__ = f'exception_wrapper_{func.__name__}'
        return wrapper
    return inner


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/streams', methods=['POST'])
@handle_exception()
def youtube_streams():
    """
    Endpoint returns list of an available video streams
    for a given URL
    """
    url = str(request.get_json())
    session['url'] = url

    youtube = YouTube(url)

    streams = []
    for stream in youtube.streams:
        streams.append({
            'itag': stream.itag,
            'res': stream.resolution,
            'mime_type': stream.mime_type,
            'fps': stream.fps if hasattr(stream, 'fps') else '',
            'bitrate': stream.bitrate,
            'acodec': stream.audio_codec,
            'vcodec': ", ".join(stream.codecs),
            'progressive': stream.is_progressive,
            'file_size': stream.filesize,
            'title': stream.title,
            'type': stream.type
        })

    return jsonify({
        'title': youtube.streams[0].title,
        'thumbnail': youtube.thumbnail_url,
        'streams': streams
    })


@app.route('/download/<itag>', methods=['GET'])
@handle_exception()
def download_file(itag):
    """
    Download a video stream as a file
    """
    youtube = YouTube(session['url'])
    stream = youtube.streams.get_by_itag(int(itag))

    stream.download()

    file_handle = open(stream.default_filename, 'rb')

    @after_this_request
    def remove_file(response):
        try:
            file_handle.close()
            os.remove(stream.default_filename)
        except Exception as error:
            app.logger.error("Error removing or closing downloaded file handle", error)

        return response

    return send_file(file_handle, mimetype=stream.mime_type, as_attachment=True, download_name=stream.default_filename)

################################################
# Static directories
################################################
@app.route('/css/<path:filename>')
def css_dir(filename):
    return redirect(url_for('static', filename=f'css/{filename}'))


@app.route('/js/<path:filename>')
def js_dir(filename):
    return redirect(url_for('static', filename=f'js/{filename}'))


@app.route('/images/<path:filename>')
def images_dir(filename):
    return redirect(url_for('static', filename=f'images/{filename}'))


if __name__ == '__main__':
    try:
        run_simple('0.0.0.0', 8080, app, use_reloader=False, use_debugger=True, use_evalex=True, threaded=True)
    except Exception as ex:
        logging.error(f'Server starting exception: {ex}')
