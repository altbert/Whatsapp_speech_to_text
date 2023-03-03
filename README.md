# Whatsapp Speech To Text
Speech to text in Whatsapp using [Whisper](https://github.com/openai/whisper) and [Whatsapp-Web.js](https://github.com/pedroslopez/whatsapp-web.js), running on Docker.   
Originally the program was using Google Cloud Speech.   
   
<p align="left">
  <img src="https://github.com/altbert/Whatsapp_speech_to_text/raw/main/media/Screenshot.jpg" width="400" title="Example">
</p>
   
   
### Description
Once authenticated on Whatsapp Web, the worker will transcribe, using Whisper API, all voice messages that you reply with "!tran".  
For now it's only configured to transcribe from contacts saved in your contact book.  
     
If you want to contribute just send a pull request   
   
### Usage
Just reply to the voice message you want to transcribe with **!tran**

### Running the server
- To build the images run ```docker-compose build```
- To run the containers run ```docker-compose up``` (Do not detach, the qr will be displayed in the terminal)

### Configuration
- To configure the path where chrome session will reside, the Docker api address and the OpenAI key edit the environment variables inside the ```docker-compose.yml``` file. The default values are: 
  - HOST_ADDRESS: whisper_api
  - CHROME_DATA_PATH: "/app/data/"
  - OPENAI_API_KEY: "YOUR-OPEANAI-API-KEY"
- If you want to use the code outside docker, you will need to edit the env variables in the index.js file, to point to your api address.
- Editing the variables response ```responseMsgHeader``` and ```responseMsgHeaderError``` inside the **node/index.js**. You can edit the header of the automatic response.

### TODO
- [ ] As the python api it's useless here, because we are no loading the models in our computer and just retrieving the data from the OpenAI API. All of this can be done from inside de node index.js file

### BUGs
- For now files that are older than the session can't be fetched. Solution might be to retrieve the file with some function and cache it.
  - **UPDATE:** Due to the [inability of the library whatsapp-web.js to retrieve messages by id](https://github.com/pedroslopez/whatsapp-web.js/issues/254) this bug cannot be fixed for now. Maybe there is another solution, but i don't see it.
