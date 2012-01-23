var RWBRoomBuilder = function (config)
{
	var self = this;
	var room = config;
	if (!room) {
		return Ext.Msg.alert("No room given");
	}
	self.window = null;

	Room.load(room.location,
	{
		failure: function (record, op) {
		},
		success: function (room)
		{
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
					name: "title." + locale ,
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
					name: "description." + locale,
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
								room: room,
								handlers: {
									afterSave: function (data) {
										room.set('exits', data);
										exitbuilder.close();
	//									room.data.exits
									}
								}
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

			self.roomform = Ext.create('Ext.form.Panel', { items: fields, ref: 'roomForm' });

			self.window = new Ext.create('Ext.window.Window', {
				title: "Edit Room - " + room.get('location'),
				width: '80%',
				height: '80%',
				items: [ self.roomform ],
				buttons: [
					{
						text: "Delete",
						handler: function () {
						}
					},
					{
						text: "Save",
						handler: function () {
							var values = self.roomform.getValues();
							var description = {};
							var title = {};
							var cleanvals = {};
							for (var key in values) {
								if (/^desc/.test(key)) {
									description[key.split('.')[1]] = values[key];
									continue;
								}

								if (/^title/.test(key)) {
									title[key.split('.')[1]] = values[key];
									continue;
								}

								cleanvals[key] = values[key];
							}

							cleanvals.exits = room.data.exits;
							cleanvals.description = description;
							cleanvals.title = title;

							for (var i in cleanvals) {
								room.set(i, cleanvals[i]);
							}

							room.save({
								callback: function (records, op, success) {
									if (!records.data.location) {
										return Ext.Msg.alert("Failed to save room!");
									}

									Ext.Msg.alert("Room Saved!");
									self.window.close();
								}
							});
						}
					}
				]
			});
			self.window.show();
		}
	});
};

