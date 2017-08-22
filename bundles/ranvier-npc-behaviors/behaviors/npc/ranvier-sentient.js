'use strict';

/**
 * This is a behavior to allow NPCs to respond to player input powered by API.ai
 * To use this behavior you must have an API.ai account. You will need to get your
 * developer key and put it in a file called `APIAIKEY` in the base of this bundle directory
 *
 * The behavior currently listens for intents with the following actions so you can either
 * create your own intents in the API.ai dashboard with these actions or create your own
 * and customize this behavior
 *
 * - shop.list: "What's for sale?"
 * - query.about: "Who are you?"
 * - query.area: "Where am I?"
 * - smalltalk.greeting: "Hello"
 * - smalltalk.thanks: "Thanks"
 *
 * This allows you to leverage the language parsing of api.ai to execute in game commands
 * or simply have an NPC carry on a conversation with a player in a natural way. It is currently
 * only triggered via the `talk` command, e.g., `talk to Wally what's for sale?` but can be triggered
 * by anything firing the `conversation` event on an NPC.
 */

const apiai = require('apiai');
const uuid = require('node-uuid');
const sessionId = uuid.v4();
const fs = require('fs');
let clientKey = null;
try {
  clientKey = fs.readFileSync(fs.realpathSync(__dirname + '/../../APIAIKEY')).toString('utf8').trim();
} catch (e) {}
var service = null;

if (clientKey) {
  service = apiai(clientKey);
}

module.exports = srcPath => {
  const B = require(srcPath + 'Broadcast');
  const Logger = require(srcPath + 'Logger');

  return {
    listeners: {
      conversation: state => function (config, player, message) {

        const failure = _ => {
          return B.sayAt(player, "They didn't seem to understand you.");
        };

        if (!service) {
          return failure();
        }

        const request = service.textRequest(message, { sessionId });

        request.on('response', response => {
          if (player.room !== this.room) {
            return;
          }

          const result = response.result;
          if (!result.action) {
            return failure();
          }

          switch (result.action) {
            case 'shop.list':
              if (!this.hasBehavior('vendor')) {
                if (result.fulfillment && result.fulfillment.speech) {
                  return B.sayAt(player, `<b><cyan>${this.name} says, "${result.fulfillment.speech}"</cyan></b>`);
                }

                return failure();
              }

              state.CommandManager.get('shop').execute('list', player, 'shop');
              break;

            default:
              const defaultResponses = {
                'query.about': `I'm ${this.name}.`,
                'query.area': `You're in ${this.room.area.title}.`,
              };

              const reply =
                (config.responses && config.responses[result.action]) ||
                defaultResponses[result.action] ||
                (result.fulfillment && result.fulfillment.speech)
              ;

              if (!reply) {
                return failure();
              }

              B.sayAt(player, `<b><cyan>${this.name} says, "${reply}"</cyan></b>`);
              break;
          }

          B.prompt(player);
        });

        request.on('error', err => {
          Logger.error('API-AI Error Response');
          console.log(err);
          failure();
        });

        request.end();
      }
    }
  };
};

