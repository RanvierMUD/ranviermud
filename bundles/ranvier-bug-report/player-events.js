'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Logger = require(srcPath + 'Logger');

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
    return `Type: ${type} Reported By: ${this.name} Room: ${this.room.title} Time: ${Date.now()} Description: ${description}`.concat(getSpecializedReport.call(this, type, description));
  }

  function getSpecializedReport(type, description) {
    const room = this.room;
    const serializeRoom = room => ({
      name: room.name,
      desc: room.description,
      entities: [...room.items, ...room.players, ...room.npcs].map(ent => ({name: ent.name, id: ent.id }))
    });

    switch (type) {
      case 'bug':
        return `PlayerData: ${this.serialize()} RoomData: ${serializeRoom(room)}`;
      case 'typo':
        return `PlayerInv: ${this.inventory.serialize()} RoomData: ${serializeRoom(room)}`;
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
      }
    }
  };
};
