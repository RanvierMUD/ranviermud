'use strict';

class Helpfile {
  constructor(bundle, name, options) {
    this.bundle = bundle;
    this.name = name;

    if (!options || !options.body) {
      throw new Error(`Help file [${name}] has no content`);
    }

    this.keywords = options.keywords || [name];
    this.command = options.command;
    this.channel = options.channel;
    this.related = options.related || [];
    this.body = options.body;
  }

  render(state) {
    let body = this.body;
    const name = this.name;

    const bar = "<yellow>---------------------------------------------------------------------------------</yellow>\r\n";

    const width = 80;
    let header = bar;
    // center name
    header += (new Array(width / 2 - Math.ceil(name.length / 2)).join(' '));
    header += '<bold><white>' + name + '</white></bold>\r\n';
    header += bar;

    if (this.command) {
      header += 'Syntax: ' + state.CommandManager.get(this.command).usage + '\r\n\r\n';
    } else if (this.channel) {
      // TODO: get channel usage
    }

    let footer = bar;
    if (this.related.length) {
      footer = "<yellow>------------------------------------RELATED--------------------------------------</yellow>\r\n";
      const related = this.related.join(', ');
      footer += (new Array(width / 2 - Math.ceil(related.length / 2)).join(' '));
      footer += related + '\r\n';
      footer += bar;
    }

    return header + this.body + footer;
  }
}

module.exports = Helpfile;
