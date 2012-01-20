Ext.define('Room', {
	extend: "Ext.data.Model",
	fields: [
		{name: 'title', type: 'auto'},
		{name: 'description', type: 'auto'},
		{name: 'exits', type: 'auto'},
		{name: 'location', type: 'int'},
		{name: 'area', type: 'string'},
	],
});

Ext.define('Area', {
	extend: "Ext.data.Model",
	fields: [
		{name: 'name', type: 'string'},
		{rooms: 'rooms', type: 'auto'},
	]
});

var exitBuilder = function (config)
{
	var self = this;
	var room = config.room;
	if (!room) {
		return Ext.Msg.alert("No room given");
	}

	var exits = [];
	room.data.exits.forEach(function (exit)
	{
		var exitfields = [
			Ext.create('Ext.form.field.Number', {
				anchor: '100%',
				name: 'location',
				value: exit.location,
				fieldLabel: 'Location',
				ref: 'location'
			}),
		];


		if (exit.leave_message) {
			var lm_fields = [];
			for (var locale in exit.leave_message) {
				lm_fields.push(Ext.create('Ext.form.TextField', {
					fieldLabel: locale,
					value: exit.leave_message[locale],
					ref: locale
				}));
			}
			exitfields.push(Ext.create('Ext.form.FieldSet', {
				title: "Leave Message",
				items: lm_fields,
				ref: 'leave_message'
			}));
		}

		exitfields.push({
			xtype: 'panel',
			layout: {type: 'hbox', align: 'top', pack: 'end'},
			border: false,
			items: [
				Ext.create('Ext.button.Button', {
					text: 'Delete',
					handler: function () {
						self.window.down("[ref=roomForm]").down("[ref='"+exit.direction+"']").destroy();
					}
				}),
			]
		});

		exits.push(Ext.create('Ext.form.FieldSet', {
			title: exit.direction,
			ref: exit.direction,
			items: exitfields,
			collapsible: true,
			padding: '10 10 10 10'
		}))
	});

	self.window = new Ext.create('Ext.window.Window', {
		title: "Exits editor",
		width: '80%',
		height: '80%',
		items: [ Ext.create('Ext.form.Panel', { items: exits, ref: 'roomForm' }) ]
	});
};

Ext.require('Ext.data.Store');
var Builder = function (config)
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

//	var Room = Ext.ModelMgr.getModel('Room');
//	console.log(roomStore);

	var rwbGrid = Ext.create('Ext.grid.Panel', {
		renderTo: Ext.getBody(),
		store: areaStore,
		title: 'Rooms',
		columns: [
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
				},
				listeners: {
					click: function (grid, cell, index)
					{
						var exitbuilder = new exitBuilder({room: grid.getStore().getAt(index)});
						exitbuilder.window.show();
					}
				}
			}
		]
	});
};
