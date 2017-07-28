'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Logger = require(srcPath + 'Logger');
  const Config = require(srcPath + 'Config');
  const PlayerRoles = require(srcPath + 'PlayerRoles');
  const RoleAudience = require(srcPath + 'ChannelAudience/RoleAudience');

  function getReportMethod(type) {
    switch (type) {
      case 'bug':
        return Logger.error;
      case 'typo':
        return Logger.warn;
      case 'suggestion':
      default:
        return Logger.verbose;
    }
  }

  function getFormattedReport(type, description) {
    const header = getReportHeader.call(this, type, description);
    const specialized = getSpecializedReport.call(this, type, description);
    return `${header}${specialized}`;
  }

  function getReportHeader(type, description) {
    const now = (new Date()).toISOString();
    return `REPORT\nType: ${type}\nReported By: ${this.name}\nRoom: ${this.room.title}\nTime: ${now}\nDescription: ${description}\n`;
  }

  function getSpecializedReport(type, description) {
    const room = this.room;
    const serializeRoom = room => JSON.stringify({
      name: room.name,
      desc: room.description,
      entities: [...room.items, ...room.players, ...room.npcs].map(ent => ({name: ent.name, id: ent.id, desc: ent.description || '' }))
    });

    switch (type) {
      case 'bug':
        return `PlayerData: ${JSON.stringify(this.serialize())} RoomData: ${serializeRoom(room)}`;
      case 'typo':
        return `PlayerInv: ${JSON.stringify(this.inventory.serialize())} RoomData: ${serializeRoom(room)}`;
      case 'suggestion':
      default:
        return '';
    }
  }

  return {
    listeners: {
      bugReport: state => function (report) {
        const { description, type } = report;
        const reportMethod = getReportMethod(type);
        const formattedReport = getFormattedReport.call(this, type, description);

        reportMethod(formattedReport);
        if (Config.get('reportToAdmins')) {
          const message = `Report from ${this.name}: ${description}. See the server logs for more details.`;
          const minRole = type === 'bug'
            ? PlayerRoles.ADMIN
            : PlayerRoles.BUILDER;
          Broadcast.sayAt(new RoleAudience({ minRole }), message);
        }
      }
    }
  };
};
