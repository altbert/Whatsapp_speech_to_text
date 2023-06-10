FROM python:3.9.14-bullseye

# Install dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt requirements.txt
# Install Whisper
RUN pip install -r requirements.txt --no-cache-dir

ARG MODEL_VERSION

WORKDIR /usr/src/app

COPY api.py .

EXPOSE 5000

CMD [ "gunicorn", "api:app", "-w", "1", "--threads", "1", "-b", "0.0.0.0:5000" ]
