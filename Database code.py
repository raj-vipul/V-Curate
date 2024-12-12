from flask import Flask, request, jsonify
from flask_cors import CORS
import yt_dlp
import re
import os

app = Flask(__name__)
CORS(app)  # Allow all origins (use specific origins in production)

# Regular expression for validating YouTube URLs
YOUTUBE_URL_PATTERN = re.compile(r'(https?://)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)/.+')

@app.route('/download', methods=['POST'])
def download_video():
    url = request.json.get('url')
    if not url:
        return jsonify({'error': 'No URL provided'}), 400
    
    # Check if the URL is valid
    if not YOUTUBE_URL_PATTERN.match(url):
        return jsonify({'error': 'Invalid YouTube URL'}), 400
    
    try:
        # Define download options
        ydl_opts = {
            'format': 'best',
            'outtmpl': 'D:/yt_download/%(title)s.%(ext)s',  # Change the output path if needed
        }

        # Download the video
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        
        return jsonify({'status': 'Download complete'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    if not os.path.exists('D:/yt_download'):
        os.makedirs('D:/yt_download')  # Create the download directory if it doesn't exist
    app.run(debug=True, port=5000)
