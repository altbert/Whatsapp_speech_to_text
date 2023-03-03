from flask import Flask, abort, request
from tempfile import NamedTemporaryFile
from os import environ
import openai
import ffmpeg

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
        temp_in = NamedTemporaryFile(suffix=".opus")
        temp_out = NamedTemporaryFile(suffix=".mp3")
        # Write the user's uploaded file to the temporary file.
        # The file will get deleted when it drops out of scope.
        handle.save(temp_in)

        stream = ffmpeg.input(temp_in.name).output(temp_out.name)
        ffmpeg.run(stream, quiet=True, overwrite_output=True)
        # Let's get the transcript of the temporary file.
        result = openai.Audio.transcribe("whisper-1", temp_out)
        # Now we can store the result object for this file.
        results.append({
            'filename': filename,
            'transcript': result['text'],
        })

    # This will be automatically converted to JSON.
    return {'results': results}
