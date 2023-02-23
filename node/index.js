const fs = require('fs');
const qrcode = require('qrcode-terminal');

const { Client, LocalAuth } = require('whatsapp-web.js');

const speech = require('@google-cloud/speech');

// Creates a client for speech to text
const clientSTT = new speech.SpeechClient();

//Retrive already created auth file
const SESSION_FILE_PATH = './session.json';
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
	sessionCfg = require(SESSION_FILE_PATH);
}

const client = new Client({
	authStrategy: new LocalAuth(),
	puppeteer: {
		headless: false
	},
	session: sessionCfg
});


client.initialize();

client.on('qr', qr => {
	qrcode.generate(qr, {small: true});
});

//Lista blanca de contactos
async function ContactsWhiteList(Contact) {
	//var phone = require('phone-regex');
	//
	//let chats = await client.getChatById(Contact); //debug

	//var phone = require('phone-regex');
	
	//let ChatInfo = await client.getChatById(Contact);
	let ContactInfo = await client.getContactById(Contact);

	//if (ContactInfo.isGroup) {
	//	console.log(JSON.stringify(ChatInfo));
	//}

	//console.log(JSON.stringify(ContactInfo));	//debug
	//console.log(JSON.stringify(ContactInfo.name));	//debug
	//console.log(JSON.stringify(ContactInfo.isMyContact));	//debug
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

	// if(message.body.includes("prueba")) {
	// 	message.reply('Ahh mira voos');
	// 	chat.markUnread();
	// }
	// if(message.body === 'Probando') {
	// 	client.sendMessage(message.from, 'Probame esta!');
	// 	chat.markUnread();
	// }
	// if(message.body === 'Chau') {
	// 	client.sendMessage(message.from, 'cha!');
	// 	chat.markUnread();
	// }
	// if(message.body === '!ayuda') {
	// 	client.sendMessage(message.from, '*Este es un mensaje de ayuda*.\n\n\nComandos que se pueden pueden utilizar:\n\n*!ayuda*: Muestra este mensaje de ayuda\n\n*!tran*: Transcribe un mensaje de audio a texto\nresponder al audio enviado con *!tran*');
	// 	chat.markUnread();
	// }

}

//TODO: implementar la descarga de media en una funcion
async function DownloadMedia(message, formattedDate, formattedTime, Contact) {
	const attachmentData = await message.downloadMedia();
	//console.log(attachmentData); //debug
	//message.reply(`
	//	*Media info*
	//	MimeType: ${attachmentData.mimetype}
	//	Filename: ${attachmentData.filename}
	//	Data (length): ${attachmentData.data.length} bytes
	//`);
	//TODO: Crea directiorio si es que no existe
	//if (!fs.existsSync("./Media/"+Contact+"/")){
	//	fs.mkdirSync("./Media/"+Contact+"/");
	//}
	//TODO: Mandar una solicitud de no lectura para que no quede el mensaje sin leer
	//Nombre del archivo a guardar
	var filename_save = formattedDate+"_"+formattedTime+"-"+"("+Contact+")"+"."+attachmentData.mimetype.split("/")[1].split(";")[0]
	
	//Guarda el archivo
	fs.writeFileSync("./Media/"+filename_save, attachmentData.data, "base64");
	//Mensaje si el mensaje es un archivo de media
	if (message.type.includes("ptt") || message.type.includes("audio")) {
		var message_text = message.body+'🎤 \x1b[34mAudio\x1b[0m - '+filename_save
		SpeechToTextTranscript(attachmentData.data, message);
	} else if (message.type.includes("video")) {
		var message_text = message.body+'📼 \x1b[34mVideo\x1b[0m - '+filename_save
	} else if (message.type.includes("image")) {
		var message_text = message.body+'🖼️ \x1b[34mImage\x1b[0m - '+filename_save
	}

	return message_text;
}

//Text to speech function
async function SpeechToTextTranscript(base64data, message) {
	// The audio file's encoding, sample rate in hertz, and BCP-47 language code
	const config = {
		encoding: 'OGG_OPUS',
		sampleRateHertz: 16000,
		languageCode: 'es-AR',
		model: 'default',
		recordingDeviceType: 'SMARTPHONE',
		microphoneDistance: 'NEARFIELD',
	};
	
	const audio = {
		content: base64data,
	};
  
	const request = {
		audio: audio,
		config: config,
		};

	// Detects speech in the audio file
	const [response] = await clientSTT.recognize(request);
	const transcription = response.results.map(result => result.alternatives[0].transcript).join('\n');
	var confidence2 = response.results.map(result => result.alternatives[0].confidence);
	confidence2 = parseFloat(confidence2)*100; //da el valor en porcentaje
	console.log(confidence2)
	console.log(`Transcription: ${transcription}`);
	if (confidence2 >= 90.0) {
		//message.reply("*Esto es un mensaje automatico.*\n_Transcripcion del audio:_\n\n"+transcription+"\n\nConfidencia de la transcripcion: %.0f %",parseFloat(confidence2)*100);

		message.reply("*Esto es un mensaje automatico.*\n_Transcripcion del audio:_\n\n"+transcription+"\n\n\n_Confidencia de la transcripcion: "+confidence2.toFixed()+"%_");
		let chat = await message.getChat();
		chat.markUnread();
	}
}

//Log successful client connection
client.on('ready', () => {
	console.log('Client is ready!');
});

//Main
client.on('message', async message => {

	//let chats = await client.getChats(); //debug
	//console.log(JSON.stringify(chats));	//debug

	//Retrive variables de contacto o no contacto
	//Lista blanca de contactos, descomentar para permitir solo los contactos de la lista
	const [Contact, Listed] = await ContactsWhiteList(message.from);
	//Lista negra de contactos, descomentar para permitir todos los contactos que no esten en la lista
	//const [Contact, Listed] = ContactsBlackList(message);
	//var Listed = ( 1 = Listed | 0 = Not Listed)

	//console.log(Contact,Listed) //debug

	if (Listed === 1) {
		//Mensajes automatizados
		AutomatedMessages(message);

		//Retrive fecha y hora
		//Genera una fecha y una hora basado en el timestamp del mensaje (unix time)
		const [formattedTime, formattedDate] = GetDate(message.timestamp);

		//console.log(formattedTime,formattedDate) //debug

		var message_text = message.body //Variable en donde se guarda el texto del mensaje
		//if (message.hasMedia) {
		//	var message_text = DownloadMedia(message, formattedDate, formattedTime, Contact);
		//}

		//Descarga los archivos de media
		if (message.hasMedia) {
			const attachmentData = await message.downloadMedia();
			//console.log(attachmentData); //debug
			//message.reply(`
			//	*Media info*
			//	MimeType: ${attachmentData.mimetype}
			//	Filename: ${attachmentData.filename}
			//	Data (length): ${attachmentData.data.length} bytes
			//`);
			//TODO: Crea directiorio si es que no existe
			//if (!fs.existsSync("./Media/"+Contact+"/")){
			//	fs.mkdirSync("./Media/"+Contact+"/");
			//}
			//TODO: Mandar una solicitud de no lectura para que no quede el mensaje sin leer
			//Nombre del archivo a guardar
			var filename_save = formattedDate+"_"+formattedTime+"-"+"("+Contact+")"+"."+attachmentData.mimetype.split("/")[1].split(";")[0]
			
			//Guarda el archivo
			fs.writeFileSync("./Media/"+filename_save, attachmentData.data, "base64");
			//Mensaje si el mensaje es un archivo de media
			if (message.type.includes("ptt") || message.type.includes("audio")) {
				var message_text = message.body+'🎤 \x1b[34mAudio\x1b[0m - '+filename_save
				SpeechToTextTranscript(attachmentData.data, message);
			} else if (message.type.includes("video")) {
				var message_text = message.body+'📼 \x1b[34mVideo\x1b[0m - '+filename_save
			} else if (message.type.includes("image")) {
				var message_text = message.body+'🖼️ \x1b[34mImage\x1b[0m - '+filename_save
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
