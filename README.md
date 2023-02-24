# Whatsapp Speech To Text
Speech to text in Whatsapp using [Whisper](https://github.com/openai/whisper) and [Whatsapp-Web.js](https://github.com/pedroslopez/whatsapp-web.js)

### Usage
- To build the images run ```docker-compose build```
- To run the containers run ```docker-compose up``` (Do not dettach, the qr will me displayed in the terminal)

### Configuration
- Edit the model you need in the api file located in api/api.py ```model = whisper.load_model('YOU_MODEL')```. Default model: **tiny**
- Uncoment the model you want to use and comment the rest in the Dockerfile located in api/Dockerfile. Default model: **tiny**
- To configure the path and the api address edit the enviroment variables inside the ```docker-compose.yml``` file. The default values are: 
  - HOST_ADDRESS=whisper_api
  - CHROME_DATA_PATH="/app/data/"
- If you want to use the code outside docker, you just have to edit the env variables in the index.js file.
