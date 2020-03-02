var config = require("./config");
var botId = config.credentials.botId;
var botName = config.credentials.botName;
var sdk = require("./lib/sdk");
var Promise = sdk.Promise;
var request = require("request");

//Twitio configurations
var twilio = require('twilio');
var accountSid = config.twilioId.accountSid; // Your Account SID from www.twilio.com/console
var authToken = config.twilioId.authToken;   // Your Auth Token from www.twilio.com/console
var messagingServiceSid = config.twilioId.messagingServiceSid;   // Your Message service ID Token from www.twilio.com/console

module.exports = {
	botId   : botId,
	botName : botName,
	 on_user_message : function(requestId, data, callback) {
		sdk.sendBotMessage(data, callback);
		console.log("###request id: " + requestId);
		console.log("on_user_message ==> " + data.message);
	},
	on_bot_message  : function(requestId, data, callback) {
		sdk.sendUserMessage(data, callback);
		console.log("###request id: " + requestId);
		console.log("on_bot_message ==> " + data.message);
	},
	on_webhook      : function(requestId, data, componentName, callback) {
		console.log("###request id: " + requestId);
		var context = data.context;
		if (componentName === 'sendText') {
			var smsClient = new twilio(accountSid, authToken);
			var text;
			console.log("on_webhook ==> calling API for hookCallAPIFromBotkit");
			console.log("wait on... " + new Date());
			sdk.saveData(requestId, data).then(function() {
				if(data.context.smsText){
					text = data.context.smsText;				
					var ani = data.context.session.BotUserSession.ivr.ani;
					ani = '+1'+ ani.split('@')[0];
					console.log("User ANI#### ",ani);
					console.log("User text: ", text);
					for (var i = 0; i<text.length;i++){
						if (i === text.length - 1){
							smsClient.messages.create({
    							body: text[i],
    							to: ani,  // Text this number
    							messagingServiceSid: messagingServiceSid, // From a valid Twilio messageService id
							}).then((twilioResp) => {
								data.context.twilioResp = twilioResp;
								console.log(twilioResp);
								sdk.respondToHook(data);
								console.log("wait done... " + new Date());
							});
						} else {
							smsClient.messages.create({
    							body: text[i],
    							to: ani,  // Text this number
    							messagingServiceSid: messagingServiceSid, // From a valid Twilio messageService id
							}).then((twilioResp) => {
								console.log("wait done... " + new Date());
								console.log(twilioResp);
							});
							
						}
					};
					callback(null, new sdk.AsyncResponse());
				};
			});
		}        
	},
	on_agent_transfer : function(requestId, data, callback){
		return callback(null, data);
	}
};