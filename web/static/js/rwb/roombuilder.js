var RWBRoomBuilder = function (config)
{
	var self = this;
	var room = config;
	if (!room) {
		return Ext.Msg.alert("No room given");
	}
	self.window = null;

	var roomStore = Ext.create('Ext.data.Store', {
		model: 'Room',
		proxy: {
			type: 'ajax',
			url : '/room/' + room.location,
			reader: {
				type: 'json',
				root: 'room'
			}
		},
		autoLoad: true,
		listeners: { load: function (store, records, success)
		{
			var room = records[0];

			var fields = [
				Ext.create('Ext.form.field.Number', {
					anchor: '100%',
					name: 'location',
					value: room.get('location'),
					fieldLabel: 'Location',
					ref: 'location'
				})
			];

			var title_fields = [];
			for (var locale in room.data.title) {
				title_fields.push(Ext.create('Ext.form.TextField', {
					fieldLabel: locale,
					value: room.data.title[locale],
					ref: locale
				}));
			}
			fields.push(Ext.create('Ext.form.FieldSet', {
				title: "Title",
				items: title_fields,
				ref: 'title'
			}));

			var desc_fields= [];
			for (var locale in room.data.description) {
				desc_fields.push(Ext.create('Ext.form.TextField', {
					fieldLabel: locale,
					value: room.data.description[locale],
					ref: locale
				}));
			}
			fields.push(Ext.create('Ext.form.FieldSet', {
				description: "Title",
				items: desc_fields,
				ref: 'description'
			}));

			var exitfields = [];
			for (var i in room.data.exits) {
				exitfields.push({
					xtype: 'displayfield',
					value: room.data.exits[i].direction
				});
			}

			exitfields.push({
				xtype: 'panel',
				layout: {type: 'hbox', align: 'top', pack: 'end'},
				border: false,
				items: [
					Ext.create('Ext.button.Button', {
						text: 'Edit',
						handler: function () {
							var exitbuilder = new RWBExitBuilder({
								room: room
							});

							exitbuilder.show();
						}
					})
				]
			});

			fields.push(Ext.create('Ext.form.FieldSet', {
				title: "Exits",
				items: exitfields
			}));

			self.window = new Ext.create('Ext.window.Window', {
				title: "Edit Room - " + room.get('location'),
				width: '80%',
				height: '80%',
				items: [ Ext.create('Ext.form.Panel', { items: fields, ref: 'roomForm' }) ],
				buttons: [
					{
						text: "Delete",
						handler: function () {
						}
					},
					{
						text: "Save",
						handler: function () {
						}
					}
				]
			});
			self.window.show();
		}}
	});
};

