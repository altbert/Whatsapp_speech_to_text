FROM python:3.10.10-bullseye

# Install dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

# Python requirements
COPY requirements.txt .

# Install Whisper
RUN pip install -r requirements.txt --no-cache-dir

ARG MODEL_VERSION

WORKDIR /usr/src/app

COPY whisper_api.py .

EXPOSE 5000

CMD [ "gunicorn", "whisper_api:app", "-w", "2", "--threads", "2", "-b", "0.0.0.0:5000" ]
