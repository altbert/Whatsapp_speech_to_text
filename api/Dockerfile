FROM python:3.9.14-bullseye

# Install dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

# Install Whisper
RUN pip install -U openai-whisper && pip install flask && pip install gunicorn


# Download model file (SETUP MODEL VERSION IN docker-compose.yml FILE)
RUN whisper --model ${MODEL_VERSION} dummy.wav; exit 0

WORKDIR /usr/src/app

COPY api.py .

EXPOSE 5000

CMD [ "gunicorn", "api:app", "-w", "2", "--threads", "2", "-b", "0.0.0.0:5000" ]
