'use strict';
var Alexa = require('alexa-sdk');
var APP_ID = undefined;  // can be replaced with your app ID if publishing
var facts = require('./facts');

var GET_FACT_MSG_EN = [
    "Here's your fact: ",
    "Did you know that: ",
    "I find it very intresting that: ",
    "Time for your architecture history lesson: ",
    "Now listen up: "
]

var GET_REPROMPT_MESSAGE_EN = [
    "Would you lear to hear about another fact: ",
    "Do you have any other question: ",
    "Would you like to try antoher year: ",
    "How about something else: "
]

// Test hooks - do not remove!
exports.GetFactMsg = GET_FACT_MSG_EN;
var APP_ID_TEST = "mochatest";  // used for mocha tests to prevent warning
// end Test hooks
/*
    TODO (Part 2) add messages needed for the additional intent
    TODO (Part 3) add reprompt messages as needed
*/
var languageStrings = {
    "en": {
        "translation": {
            "FACTS": facts.FACTS_EN,
            "SKILL_NAME": "Architecture History Facts",  // OPTIONAL change this to a more descriptive name
            "GET_FACT_MESSAGE": GET_FACT_MSG_EN,
            "GET_REPROMPT_MESSAGE": GET_REPROMPT_MESSAGE_EN,
            "NO_YEAR_MESSAGE": "Sorry I don't have a fact for ",
            "HELP_MESSAGE": "You can say tell me a fact, or, you can say exit... What can I help you with?",
            "HELP_REPROMPT": "What can I help you with?",
            "STOP_MESSAGE": "Goodbye!"
        }
    }
};

exports.handler = function (event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    // set a test appId if running the mocha local tests
    if (event.session.application.applicationId == "mochatest") {
        alexa.appId = APP_ID_TEST
    }
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
    // TODO (Part 2) add an intent for specifying a fact by year named 'GetNewYearFactIntent'
    // TODO (Part 2) provide a function for the new intent named 'GetYearFact' 
    //     that emits a randomized fact that includes the year requested by the user
    //     - if such a fact is not available, tell the user this and provide an alternative fact.

    // TODO (Part 3) Keep the session open by providing the fact with :askWithCard instead of :tellWithCard
    //     - make sure the user knows that they need to respond
    //     - provide a reprompt that lets the user know how they can respond
    // TODO (Part 3) Provide a randomized response for the GET_FACT_MESSAGE
    //     - add message to the array GET_FACT_MSG_EN
    //     - randomize this starting portion of the response for conversational variety

var handlers = {
    'LaunchRequest': function () {
        this.emit('GetFact');
    },
    'GetNewFactIntent': function () {
        this.emit('GetFact');
    },
    'GetNewYearFactIntent': function () {
        this.emit('GetYearFact');
    },
    'GetFact': function () {
        // Get a random fact from the facts list
        // Use this.t() to get corresponding language data
        var factArr = this.t('FACTS');
        var randomFact = random(factArr);

        var factMsgArr = this.t("GET_FACT_MESSAGE")
        var randomMsg = random(factMsgArr);
        
        let repromtMsgArr = this.t("GET_REPROMPT_MESSAGE");
        let repromtMsg = random(repromtMsgArr);

        // Create speech output
        var speechOutput = randomMsg + randomFact;

        this.emit(':askWithCard', speechOutput, repromtMsg, this.t("SKILL_NAME"), randomFact)
    },
    'GetNewYearFactIntent': function () {
        let year = this.event.request.intent.slots.FACT_YEAR.value;
        let factArr = this.t('FACTS');
        let yearFacts = factArr.filter(word => word.indexOf(year) >= 0);
        
        let repromtMsgArr = this.t("GET_REPROMPT_MESSAGE");
        let factMsgArr = this.t("GET_FACT_MESSAGE")
        let noYearMessage = this.t("NO_YEAR_MESSAGE");

        let randomMsg = random(factMsgArr);
        let randomYearFact = random(yearFacts);
        let randomFact = random(factArr);
        let repromtMsg = random(repromtMsgArr);

        // Create speech output
        let speechOutput = function(year, randomYearFact){
            if( randomYearFact ){
                return randomMsg + randomYearFact;
            } else {
                 return `${noYearMessage} ${year}, ` + randomMsg + randomFact;
            }
        };

        if (year) {
            this.emit(':askWithCard', speechOutput(year, randomYearFact), repromtMsg, this.t("SKILL_NAME"), randomYearFact);
        } else {
            this.emit(':ask', "Sorry I didn't understand the year you said.", "Please repeat.");
        }
    },

    'AMAZON.HelpIntent': function () {
        var speechOutput = this.t("HELP_MESSAGE");
        var reprompt = this.t("HELP_MESSAGE");
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t("STOP_MESSAGE"));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t("STOP_MESSAGE"));
    }
};

var random = function(arr) {
    // returns a random phrase
    // where phraseArr is an array of string phrases
    var i = 0;
    i = Math.floor(Math.random() * arr.length);
    return (arr[i]);
};