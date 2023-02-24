FROM python:3.9.14-bullseye

# Install dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

# Install Whisper
RUN pip install -U openai-whisper && pip install flask && pip install gunicorn


# Install model files
RUN whisper --model tiny dummy.wav; exit 0
# RUN whisper --model base dummy.wav; exit 0
# RUN whisper --model small dummy.wav; exit 0
# RUN whisper --model medium dummy.wav; exit 0
# RUN whisper --model large dummy.wav; exit 0
# RUN whisper --model l2arge-v2 dummy.wav; exit 0

WORKDIR /usr/src/app

COPY api.py .

EXPOSE 5000

CMD [ "gunicorn", "api:app", "-w", "2", "--threads", "2", "-b", "0.0.0.0:5000" ]
