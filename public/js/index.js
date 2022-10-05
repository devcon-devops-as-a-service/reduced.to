'use strict';

/**
 * Handles shortner button click.
 */
const handleShortnerClick = async () => {
	let originalUrl = document.getElementById('urlInput').value;
	let shortenInfo = await getShortenUrl(originalUrl);

	if (shortenInfo === null) {
		document.getElementById('result').textContent = 'This url is invalid..';
		return;
	}

	let { newUrl } = shortenInfo;
	document.getElementById('result').textContent = window.location.href + newUrl;
};

/**
 * Returns the shorter link from the server.
 * @param {String} originalUrl - The original url we want to shorten.
 */
const getShortenUrl = async (originalUrl) => {
	let result;
	try {
		result = await axios.post('/api/shortner', {
			originalUrl,
		});
	} catch (err) {
		return null;
	}
	return result.data;
};

/**
 * Copy link to clipboard.
 * @param {HTMLElement} htmlElement - HTML Element containing the short url.
 */
const copyUrl = async (htmlElement) => {
	navigator.clipboard.writeText(htmlElement.innerHTML);

	document.getElementById('urlAlert').classList.remove('collapse');
};
