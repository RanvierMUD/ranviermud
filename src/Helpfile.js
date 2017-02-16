'use strict';

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
    const getHeaderPadding = len => (new Array(width / 2 - Math.ceil(len / 2)).join(' '))

    let header = bar;
    header += getHeaderPadding(80, name.length); // Center name
    header += `<bold><white>${name}</white></bold>\r\n`;
    header += bar;

    const formatUsageSyntax = usage => `Syntax: ${usage}\r\n\r\n`;
    if (this.command) {
      header += formatUsageSyntax(state.CommandManager.get(this.command).usage);
    } else if (this.channel) {
      header += formatUsageSyntax(state.ChannelManager.get(this.channel).showUsage());
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
