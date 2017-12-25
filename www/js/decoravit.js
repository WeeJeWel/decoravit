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

	let activeMode = modes[0];

	cm.on('change', ( cm, changeObj ) => {
		if( changeObj.origin === 'setValue' ) return;
		// TODO
	})

	document.getElementById('beautify').addEventListener('click', beautify);

	let modeOptionEls = [];
	modes.forEach(mode => {
		let modeEl = document.createElement('div');
			modeEl.classList.add('option');
			modeEl.dataset.mode = mode.id;
			modeEl.addEventListener('click', () => {
				modeOptionEls.forEach(modeOptionEl => {
					modeOptionEl.classList.remove('active');
				})
				cm.setOption('mode', mode.cmid);
				modeEl.classList.add('active');
				activeMode = mode;
			});

		let modeIconEl = document.createElement('span');
			modeIconEl.classList.add('icon');
			modeIconEl.style.backgroundImage = `url(img/${mode.id}.svg`;
		modeEl.appendChild(modeIconEl);

		let modeSpanEl = document.createElement('span');
			modeSpanEl.textContent = mode.title;
		modeEl.appendChild(modeSpanEl);

		document.getElementById('modes').appendChild(modeEl);
		modeOptionEls.push(modeEl);
	})

	require('electron').ipcRenderer.on('action', (e, data) => {
		if( data === 'beautify' ) return beautify();
	});

	function beautify() {
		if( toolbarEl.classList.contains('loading') ) return;
			toolbarEl.classList.add('loading');

		let code = cm.getValue();
		let result = activeMode.beautifyFn(code, {});
		cm.setValue( result );
		setTimeout(() => {
			toolbarEl.classList.remove('loading');
		}, 1000)
	}

});