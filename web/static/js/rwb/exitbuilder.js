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

	return self.window;
};
