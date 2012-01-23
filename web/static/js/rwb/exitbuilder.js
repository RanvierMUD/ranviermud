var RWBExitBuilder = function (config)
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
			}),
		];


		if (exit.leave_message) {
			var lm_fields = [];
			for (var locale in exit.leave_message) {
				lm_fields.push(Ext.create('Ext.form.TextField', {
					fieldLabel: locale,
					value: exit.leave_message[locale],
					name: 'leave_message.' + locale
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
						self.window.down("[ref=exitForm]").down("[ref='"+exit.direction+"']").destroy();
					}
				}),
			]
		});
		exitfields.push({
			xtype: 'hiddenfield',
			name: 'direction',
			value: exit.direction
		});

		exits.push(Ext.create('Ext.form.FieldSet', {
			title: exit.direction,
			ref: 'exitset',
			items: exitfields,
			collapsible: true,
			padding: '10 10 10 10'
		}))
	});

	self.exitform =  Ext.create('Ext.form.Panel', { items: exits, ref: 'exitForm' });

	self.window = new Ext.create('Ext.window.Window', {
		title: "Exits editor",
		width: '80%',
		height: '80%',
		items: [self.exitform ],
		buttons: [
			{
				text: "Save",
				handler: function () {
					var exits = self.exitform.query("fieldset[ref=exitset]");
					var exitvals = [];
					for (var i in exits) {
						var exit = exits[i];
						var leave_message = {};
						var cleanvals = {};

						exit.query("field").forEach(function (field)
						{
							if (/^leave/.test(field.name)) {
								leave_message[field.name.split('.')[1]] = field.getValue();
								return;
							}

							cleanvals[field.name] = field.getValue();
						});

						if (Ext.Object.getSize(leave_message)) {
							cleanvals.leave_message = leave_message;
						}

						exitvals.push(cleanvals);
					}

					config.handlers.afterSave(exitvals);
				}
			}
		]
	});

	return self.window;
};
