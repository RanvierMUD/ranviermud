'use strict';

/**
 * Confirm new player name
 */
module.exports = (srcPath) => {
  const EventUtil = require(srcPath + 'EventUtil');
  const petrovich = require('petrovich');
  return {
    event: state => (socket, args) => {
      const say = EventUtil.genSay(socket);
      const write  = EventUtil.genWrite(socket);

      say('Ваш пол? (Мужской/Женский)');
      socket.once('data', sex => {
        sex = sex.toString().trim().toLowerCase();        
        if (sex.startsWith("м")) {
            args.sex = "мужской";
            args.genitive_case = petrovich.male.first.genitive(args.name);
            args.dative_case = petrovich.male.first.dative(args.name);   
            args.accusative_case = petrovich.male.first.accusative(args.name);
            args.prepositional_case = petrovich.male.first.prepositional(args.name);
            args.instrumental_case = petrovich.male.first.instrumental(args.name);      
        }
        else if (sex.startsWith('ж')) {
            args.sex = "женский";
            args.genitive_case = petrovich.female.first.genitive(args.name);
            args.dative_case = petrovich.female.first.dative(args.name);   
            args.accusative_case = petrovich.female.first.accusative(args.name);
            args.prepositional_case = petrovich.female.first.prepositional(args.name);
            args.instrumental_case = petrovich.female.first.instrumental(args.name);  
        }
        else {
            say('Гм... Давайте без извращений!');
            return socket.emit('choose-sex', socket, args);
        }
        
        socket.emit('choose-class', socket, args);
      });
    }
  };
};
