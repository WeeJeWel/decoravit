const electron = require('electron');
const bridge = electron.ipcRenderer;

window.addEventListener('load', () => {
	const modes = [
		{
			id: 'js',
			cmid: 'javascript',
			title: 'JavaScript / JSON',
			beautifyFn: js_beautify,
		},
		{
			id: 'html',
			cmid: 'htmlmixed',
			title: 'HTML',
			beautifyFn: html_beautify,
		},
		{
			id: 'css',
			cmid: 'css',
			title: 'CSS',
			beautifyFn: css_beautify,
		}
	]

	const indents = [
		{
			id: 'tab',
			title: 'Tab',
			spans: 1,
		},
		{
			id: 'space2',
			title: '2 Spaces',
			spans: 2,
		},
		{
			id: 'space4',
			title: '4 Spaces',
			spans: 4,
		},
	]

	const opts = {
		indent: null,
		mode: null,
	}

	const toolbarEl = document.getElementById('toolbar');
	const cmEl = document.getElementById('cm');
	const cm = CodeMirror(cmEl, {
		theme: 'monokai',
		height: '100%',
		mode: modes[0].cmid,
		lineNumbers: true,
		autofocus: true,
		styleSelectedText: true,
		value: '// paste your code here',
	});
	cm.execCommand("selectAll")

	cm.on('change', ( cm, changeObj ) => {
		if( changeObj.origin === 'setValue' ) return;
		// TODO
	})

	document.getElementById('beautify').addEventListener('click', beautify);

	let loadingTimeout;

	let modeOptionEls = {};
	modes.forEach(mode => {
		let modeEl = document.createElement('div');
			modeEl.classList.add('option');
			modeEl.addEventListener('click', () => {
				setMode(mode.id);
				bridge.send('opt', {
					id: 'mode',
					value: mode.id,
				})
			});

		let modeIconEl = document.createElement('span');
			modeIconEl.classList.add('icon');
			modeIconEl.style.backgroundImage = `url(img/${mode.id}.svg`;
		modeEl.appendChild(modeIconEl);

		let modeSpanEl = document.createElement('span');
			modeSpanEl.textContent = mode.title;
		modeEl.appendChild(modeSpanEl);

		document.getElementById('modes').appendChild(modeEl);
		modeOptionEls[mode.id] = modeEl;
	})

	function setMode( value ) {
		for( let modeId in modeOptionEls ) {
			let modeOptionEl = modeOptionEls[modeId];
			modeOptionEl.classList.toggle('active', value === modeId);
		}

		modes.forEach(mode => {
			if( mode.id === value ) {
				opts.mode = mode;
				cm.setOption('mode', mode.cmid);
			}
		})
	}

	let indentOptionEls = {};
	indents.forEach(indent => {
		let indentEl = document.createElement('div');
			indentEl.classList.add('option');
			indentEl.title = indent.title;
			indentEl.addEventListener('click', () => {
				setIndent( indent.id );
				bridge.send('opt', {
					id: 'indent',
					value: indent.id,
				})
			});

		for( let i = 0; i < indent.spans; i++ ) {
			let indentSpanEl = document.createElement('span');
			indentEl.appendChild(indentSpanEl);
		}

		document.getElementById('indent').appendChild(indentEl);
		indentOptionEls[ indent.id ] = indentEl;
	})

	function setIndent( value ) {
		for( let indentId in indentOptionEls ) {
			let indentOptionEl = indentOptionEls[indentId];
			indentOptionEl.classList.toggle('active', value === indentId);
		}

		indents.forEach(indent => {
			if( indent.id === value ) return opts.indent = indent;
		})
	}

	bridge
		.on('action', (e, data) => {
			if( data.event === 'beautify' ) return beautify();
		})
		.on('opts', ( e, opts ) => {
			for( let opt in opts ) {
				onOpt( opt, opts[opt] );
			}
			setTimeout(() => {
				bridge.send('opts');
			}, 100);
		})
		.on('opt', (e, { id, value }) => {
			onOpt( id, value );
		})
		.send('ready')

	function onOpt( id, value ) {
		if( id === 'mode' ) return setMode(value);
		if( id === 'indent' ) return setIndent(value);
	}

	function beautify() {
		let loadingEl = document.createElement('div');
			loadingEl.classList.add('loading');
		toolbarEl.appendChild(loadingEl);

		setTimeout(() => {
			loadingEl.classList.add('running');
		}, 1);

		setTimeout(() => {
			toolbarEl.removeChild(loadingEl);
		}, 1000);

		let beautifyOpts = {
			indent_inner_html: true,
			wrap_line_length: 0,
		};
		switch( opts.indent.id ) {
			case 'tab':
				beautifyOpts.indent_with_tabs = true;
				break;
			case 'space2':
				beautifyOpts.indent_with_tabs = false;
				beautifyOpts.indent_size = 2;
				break;
			case 'space4':
				beautifyOpts.indent_with_tabs = false;
				beautifyOpts.indent_size = 4;
				break;
		}

		let code = cm.getValue();
		let result = opts.mode.beautifyFn(code, beautifyOpts);
		cm.setValue( result );
	}

});