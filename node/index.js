const fs = require('fs');
const qrcode = require('qrcode-terminal');

const request = require('request');

const { Client, LocalAuth } = require('whatsapp-web.js');


const client = new Client({
	authStrategy: new LocalAuth(),
	puppeteer: {
		headless: true
	}
});


client.initialize();

client.on('qr', qr => {
	qrcode.generate(qr, {small: true});
});

//Lista blanca de contactos. Si el contacto esta agendado entonces el script funciona
async function ContactsWhiteList(Contact) {
	let ContactInfo = await client.getContactById(Contact);
	Contact = ContactInfo.name

	if (ContactInfo.isMyContact) {
		return [Contact, 1];
	} else {
		return [Contact, 0];
	}
}

//Genera una fecha y una hora basado en el timestamp del mensaje (unix time)
function GetDate(timestamp) {
		//https://stackoverflow.com/questions/847185/convert-a-unix-timestamp-to-time-in-javascript
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

//Mensajes automatizados
async function AutomatedMessages(message) {

	let chat = await message.getChat();

	if(message.body == '!tran' && message.hasQuotedMsg){
		const quotedMsg = await message.getQuotedMessage();
		// console.log("Text: "+quotedMsg.body);
		message.reply(quotedMsg.body);
		// client.sendMessage(message.from, 'test');
	}
}

//TODO: implementar la descarga de media en una funcion
async function DownloadMedia(message, formattedDate, formattedTime, Contact) {
	const attachmentData = await message.downloadMedia();

	if (message.type.includes("ptt") || message.type.includes("audio")) {
		SpeechToTextTranscript(attachmentData.data, message);
	}

	return message_text;
}

//Text to speech function
async function SpeechToTextTranscript(base64data, message) {
	const decodedBuffer = Buffer.from(base64data, 'base64');

	// Send the decoded binary file to the Flask API
	request.post({
	  url: 'http://127.0.0.1:5000',
	  formData: {
		file: {
		  value: decodedBuffer,
		  options: {
			filename: message.from
		  }
		}
	  }
	}, function(err, httpResponse, body) {
	  if (err) {
		console.error(err);
	  } else {
		console.log('Upload successful! Server responded with:', body);
	  }
	});
}

//Log successful client connection
client.on('ready', () => {
	console.log('Client is ready!');
});

//Main
client.on('message', async message => {
	const [Contact, Listed] = await ContactsWhiteList(message.from);
	if (Listed === 1) {
		//Mensajes automatizados
		AutomatedMessages(message);

		//Retrive fecha y hora
		//Genera una fecha y una hora basado en el timestamp del mensaje (unix time)
		const [formattedTime, formattedDate] = GetDate(message.timestamp);

		//console.log(formattedTime,formattedDate) //debug

		var message_text = message.body //Variable en donde se guarda el texto del mensaje

		//Descarga los archivos de media
		if (message.hasMedia) {
			const attachmentData = await message.downloadMedia();
			//Mensaje si el mensaje es un archivo de media
			if (message.type.includes("ptt") || message.type.includes("audio")) {
				var message_text = message.body+'🎤 \x1b[34mAudio\x1b[0m - '
				SpeechToTextTranscript(attachmentData.data, message);
			}
		}
		//TODO: Convinar esta funcion con la de arriba
		//https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
		console.log('\x1b[32m%s:\x1b[0m %s \x1b[5m%s\x1b[0m', Contact, message_text, formattedTime);
		//console.log(message) //debug

	}
});

//Useful links
//https://stackoverflow.com/questions/2917175/return-multiple-values-in-javascript
//https://stackoverflow.com/questions/40999025/javascript-scope-variable-to-switch-case
