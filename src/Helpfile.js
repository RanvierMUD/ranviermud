'use strict';

const Broadcast = require('./Broadcast');

class Helpfile {
  constructor(bundle, name, options) {
    this.bundle = bundle;
    this.name = name;

    if (!options || !options.body) {
      throw new Error(`Help file [${name}] has no content.`);
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
    const centerPadding = len => ' '.repeat(width / 2 - Math.ceil(len / 2));

    let header = bar;
    header += centerPadding(name.length); // Center name.
    header += `<bold><white>${name}</white></bold>\r\n`;
    header += bar;

    const formatUsageSyntax = usage => `Syntax: ${usage}\r\n\r\n`;
    if (this.command) {
      header += formatUsageSyntax(state.CommandManager.get(this.command).usage);
    } else if (this.channel) {
      header += formatUsageSyntax(state.ChannelManager.get(this.channel).getUsage());
    }

    let footer = bar;
    if (this.related.length) {
      footer = "<yellow>------------------------------------RELATED--------------------------------------</yellow>\r\n";
      const related = this.related.join(', ');
      footer += centerPadding(related.length); // Center the related topics.
      footer += related + '\r\n';
      footer += bar;
    }

    return header + Broadcast.wrap(this.body, 80) + footer;
  }
}

module.exports = Helpfile;
