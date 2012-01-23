Ext.define('Room', {
	extend: "Ext.data.Model",
	fields: [
		{name: 'title', type: 'auto'},
		{name: 'description', type: 'auto'},
		{name: 'exits', type: 'auto'},
		{name: 'location', type: 'int'},
		{name: 'area', type: 'string'},
	],
	proxy: {
		type: 'rest',
		url: 'room/',
		reader: {
			type: 'json'
		},
		writer: {
			type: 'json'
		}
	}
});

Ext.define('Area', {
	extend: "Ext.data.Model",
	fields: [
		{name: 'name', type: 'string'},
		{rooms: 'rooms', type: 'auto'},
	]
});

Ext.require('Ext.data.Store');
var RWBAreaGrid = function (config)
{
	var areaStore = Ext.create('Ext.data.Store', {
		model: 'Room',
		proxy: {
			type: 'rest',
			url : 'area/' + config.area,
			reader: {
				type: 'json',
				root: 'area.rooms'
			}
		},
		autoLoad: true
	});

	var rwbGrid = Ext.create('Ext.grid.Panel', {
		store: areaStore,
		title: 'Area List - ' + config.area,
		columns: [
			{
				xtype:'actioncolumn',
				width:50,
				items: [{
					icon: '/3rdparty/icons/fam/cog_edit.png',  // Use a URL in the icon config
					tooltip: 'Edit',
					handler: function(grid, rowIndex, colIndex) {
						var rec = grid.getStore().getAt(rowIndex);
						var editor = new RWBRoomBuilder(rec.data);
					}
				},{
					icon: '/3rdparty/icons/fam/delete.gif',
					tooltip: 'Delete',
					handler: function(grid, rowIndex, colIndex) {
						var rec = grid.getStore().getAt(rowIndex);
						alert("Terminate " + rec.get('title'));
					}
				}]
			},
			{
				text: 'Vnum',
				width: 100,
				sortable: false,
				hideable: false,
				dataIndex: 'location'
			},
			{
				text: 'Title',
				width: 100,
				sortable: false,
				hideable: false,
				dataIndex: 'title'
			},
			{
				text: 'Description',
				flex: 1,
				dataIndex: 'description'
			},
			{
				text: 'Exits',
				width: 150,
				dataIndex: 'exits',
				renderer: function (exits) {
					var exitnames = [];
					for (var e in exits) {
						exitnames.push(exits[e].direction);
					}
					return exitnames.join(", ");
				}
			}
		]
	});

	return rwbGrid;
};
