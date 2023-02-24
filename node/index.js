const fs = require('fs');

// Required for Terminal QRCode
const qrcode = require('qrcode-terminal');

// Required for POST request to api
const request = require('request');

// Required for Whatsapp Web connection
const { Client, LocalAuth } = require('whatsapp-web.js');

// Required for ENV Setup
const process = require('node:process');

// Setup env variables so it can run on docker and also as standalone
if (process.env.HOST_ADDRESS && process.env.CHROME_DATA_PATH) {
	apiHost = process.env.HOST_ADDRESS;
	dataPath = process.env.CHROME_DATA_PATH;
} else {
	apiHost = "127.0.0.1";
	dataPath = "./"
}

// Setup options for the client and data path for the google chrome session
const client = new Client({
	authStrategy: new LocalAuth({ dataPath: dataPath }),
	puppeteer: {
		headless: true,
		args: ['--no-sandbox', '--disable-setuid-sandbox']
	}
});

// Initialize client
client.initialize();

// Generates a qr in the console (for authentication)
client.on('qr', qr => {
	qrcode.generate(qr, {small: true});
});

//Log successful client connection
client.on('ready', () => {
	console.log('Client is ready!');
});

//Main
client.on('message', async message => {
	const [Contact, Listed] = await ContactsWhiteList(message.from);
	if (Listed === 1) {
		//Mensajes automatizados
		// AutomatedMessages(message);

		//Retrive fecha y hora
		//Genera una fecha y una hora basado en el timestamp del mensaje (unix time)
		const [formattedTime, formattedDate] = GetDate(message.timestamp);

		//console.log(formattedTime,formattedDate) //debug

		var message_text = message.body //Variable en donde se guarda el texto del mensaje
		let chat = message.getChat();
		//Descarga los archivos de media
		if (message.hasMedia) {
			const attachmentData = await message.downloadMedia();
			//Mensaje si el mensaje es un archivo de media
			if (message.type.includes("ptt") || message.type.includes("audio")) {
				var message_text = message.body+'🎤 \x1b[34mAudio\x1b[0m - '
				SpeechToTextTranscript(attachmentData.data, message);
				(await chat).markUnread();
			}
		}

		console.log('\x1b[32m%s:\x1b[0m %s \x1b[5m%s\x1b[0m', Contact, message.type, formattedTime);

	}
});

// Contact white list. If the sender is your contact, the audio file will be transcript
async function ContactsWhiteList(Contact) {
	let ContactInfo = await client.getContactById(Contact);
	Contact = ContactInfo.name

	if (ContactInfo.isMyContact) {
		return [Contact, 1];
	} else {
		return [Contact, 0];
	}
}

// Date and hour based on the timestamp of the mesage (unix time)
function GetDate(timestamp) {
		var date = new Date(timestamp * 1000);
		var year = date.getFullYear();
		var month = date.getMonth();
		var day = date.getDate();
		var hours = date.getHours();
		var minutes = "0" + date.getMinutes();
		var seconds = "0" + date.getSeconds();

		var formattedDate = day+"-"+month+"-"+year;
		var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

		return [formattedTime, formattedDate];
}

// TODO: when replyed with !tran, the worker will transcribe only the audio quoted
async function AutomatedMessages(message) {

	let chat = await message.getChat();

	if(message.body == '!tran' && message.hasQuotedMsg){
		const quotedMsgTemp = await message.getQuotedMessage();
		let quotedMsg = new Message(client, {
			id: { _serialized: quotedMsgTemp.id },
			hasMedia: true, // --> IMPORTANT
		});
		
		const media = await quotedMsg.downloadMedia();
		message.reply(quotedMsg.body);
	
	}
}

// Text to speech function
// TODO: reply to message outside this function
async function SpeechToTextTranscript(base64data, message) {
	const decodedBuffer = Buffer.from(base64data, 'base64');

	// Send the decoded binary file to the Flask API
	request.post({
		url: 'http://'+ apiHost +':5000',
		formData: {
		file: {
		  value: decodedBuffer,
		  options: {
			filename: message.from + message.timestamp
		  }
		}
	  }
	}, function(err, httpResponse, body) {
		if (err) {
			console.error(err);
		} else {
			console.log('Upload successful! Server responded with:', body);
			
			const data = JSON.parse(body);
			for (const result of data.results) {
				const transcript = result.transcript;
				console.log(transcript);
				message.reply("Esto es una transcripcion automatica del audio:\n\n"+transcript);
			}
		}
	});
}
