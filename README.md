# Whatsapp Speech To Text
This is a Speech-to-Text application for Whatsapp that uses [Whisper](https://github.com/openai/whisper) and [Whatsapp-Web.js](https://github.com/pedroslopez/whatsapp-web.js), running on Docker

<p align="left">
  <img src="https://github.com/altbert/Whatsapp_speech_to_text/raw/main/media/Screenshot.jpg" width="400" title="Example">
</p>
   
   
### Description
Once authenticated on Whatsapp Web, the worker will transcribe all voice messages that you reply to with the command !tran using Whisper. Currently, it is only configured to transcribe messages from contacts saved in your contact book.

Originally, the program used Google Cloud Speech, but it now uses Whisper, which is a lightweight, open-source speech recognition engine.

If you do not want to host the model directly on your computer, you can use the **main_openai_api** branch, which uses the OpenAI API to transcribe the audio.

If you want to contribute, just send a pull request.
   
### Usage
Just reply to the voice message you want to transcribe with **!tran**

### Running the server
- To build the images run ```docker-compose build```
- To run the containers run ```docker-compose up``` (Do not detach, the qr will be displayed in the terminal)

### Configuration
- To chose the model you want to use edit the variable called **MODEL_VERSION** under **x-shared-variables** inside the file docker-compose.yml. Default model: **tiny**
- To configure the path and the api address edit the environment variables inside the ```docker-compose.yml``` file. The default values are: 
  - HOST_ADDRESS=whisper_api
  - CHROME_DATA_PATH="/app/data/"
- If you want to use the code outside docker, you will need to edit the env variables in the index.js file, to point to your api address.
- If you are using a GPU add and edit, to your needs, the following code in the **whisper_api** container   
    ``` yml
        deploy:
        resources:
            reservations:
            devices:
                - driver: nvidia
                count: 1
                capabilities: [gpu]
    ```
- Editing the variables ```responseMsgHeader``` and ```responseMsgHeaderError``` inside the **node/index.js**. You can setup the message header for the automatic response.

### TODO
- [x] ~~Only transcribe if the audio is replied with "!tran"~~
- [x] ~~Send "!tran" from my chat and also transcribe the audio. For now only messages send by contacts will be transcribed.~~
- [ ] Save the models locally
- [ ] Maybe use https://github.com/ahmetoner/whisper-asr-webservice as the api
- [ ] Add environment file.

### BUGs
- ~~For now files that are older than the session can't be fetched. Solution might be to retrieve the file with some function and cache it.~~
  - ~~UPDATE: Due to the [inability of the library whatsapp-web.js to retrieve messages by id](https://github.com/pedroslopez/whatsapp-web.js/issues/254) this bug cannot be fixed for now. Maybe there is another solution, but i don't see it.~~
    - **UPDATE 2:** The Bug has been fixed using the function ```fetchMessages()``` from whatsapp-web.js, the function that handle this it's called ```downloadQuotedMedia()```