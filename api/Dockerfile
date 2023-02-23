FROM python:3.9.14-bullseye

# Install dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

# Install Whisper
RUN pip install -U openai-whisper && pip install flask


# Install model files
RUN whisper --model tiny dummy.wav; exit 0
RUN whisper --model base dummy.wav; exit 0
RUN whisper --model small dummy.wav; exit 0
RUN whisper --model medium dummy.wav; exit 0
RUN whisper --model large dummy.wav; exit 0
RUN whisper --model large-v2 dummy.wav; exit 0

WORKDIR /usr/src/app

COPY api.py .

CMD [ "python3" "./api.py" ]