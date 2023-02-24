# Whatsapp Speech To Text
Speech to text in Whatsapp using [Whisper](https://github.com/openai/whisper) and [Whatsapp-Web.js](https://github.com/pedroslopez/whatsapp-web.js), running on Docker.   
Originally the program was using Google Cloud Speech.   
   

### Description
Once authenticated on Whatsapp Web, the worker will transcribe, using Whisper, all messages received from a contact in your contact book.   
If you want to contribute just send a pull request   
   

### Usage
- To build the images run ```docker-compose build```
- To run the containers run ```docker-compose up``` (Do not detach, the qr will be displayed in the terminal)

### Configuration
- Edit the model you need in the api file located in api/api.py ```model = whisper.load_model('YOU_MODEL')```. Default model: **tiny**
- Uncomment the model you want to use and comment the rest in the Dockerfile located in api/Dockerfile. Default model: **tiny**
- To configure the path and the api address edit the environment variables inside the ```docker-compose.yml``` file. The default values are: 
  - HOST_ADDRESS=whisper_api
  - CHROME_DATA_PATH="/app/data/"
- If you want to use the code outside docker, you just have to edit the env variables in the index.js file.
- If you are using a GPU add and edit, to your needs, the following code to the **whisper_api** container   
    ```
        deploy:
        resources:
            reservations:
            devices:
                - driver: nvidia
                count: 1
                capabilities: [gpu]
    ```


### TODO
- [ ] Only transcribe if the audio is replied with "!tran"
- [ ] Send "!tran" from my chat and also transcribe the audio. For now only messages send by contacts will be transcribed.
- [ ] Save the models locally
