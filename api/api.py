from flask import Flask, abort, request
from whispercpp import Whisper
from tempfile import NamedTemporaryFile
from os import environ
import ffmpeg
import numpy as np

# Gets the env variable configured in the docker-compose.yml file
model_version = environ['MODEL_VERSION']

# Loads Whisper module from whispercpp
w = Whisper.from_pretrained(model_version)

# Auto detect language
w.params.language = "auto"

def speech_to_text(audiofile):
    try:
        y, _ = (
            ffmpeg.input(audiofile, threads=0)
            .output("-", format="s16le", acodec="pcm_s16le", ac=1, ar=16000)
            .run(
                cmd=["ffmpeg", "-nostdin"], capture_stdout=True, capture_stderr=True
            )
        )
    except ffmpeg.Error as e:
        raise RuntimeError(f"Failed to load audio: {e.stderr.decode()}") from e

    arr = np.frombuffer(y, np.int16).flatten().astype(np.float32) / 32768.0

    return w.transcribe(arr)


app = Flask(__name__)

@app.route('/', methods=['POST'])
def handler():
    # if not model:
    #     model = whisper.load_model(request_model)
        
    if not request.files:
        # If the user didn't submit any files, return a 400 (Bad Request) error.
        abort(400)

    # For each file, let's store the results in a list of dictionaries.
    results = []

    # Loop over every file that the user submitted.
    for filename, handle in request.files.items():
        # Create a temporary file.
        # The location of the temporary file is available in `temp.name`.
        temp = NamedTemporaryFile()
        # Write the user's uploaded file to the temporary file.
        # The file will get deleted when it drops out of scope.
        handle.save(temp)
        # Let's get the transcript of the temporary file.
        result = speech_to_text(temp.name)
        # Now we can store the result object for this file.
        results.append({
            'filename': filename,
            'transcript': result
        })

    # This will be automatically converted to JSON.
    return {'results': results}
