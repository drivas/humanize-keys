'use strict';
const mapObj = require('map-obj');
const humanizeString = require('humanize-string');
const QuickLru = require('quick-lru');

const has = (array, key) => array.some(x => typeof x === 'string' ? x === key : x.test(key));
const cache = new QuickLru({maxSize: 100000});

const humanizeConvert = (input, options) => {
	options = Object.assign({
		deep: false
	}, options);

	const {exclude} = options;

	return mapObj(input, (key, value) => {
		if (!(exclude && has(exclude, key))) {
			if (cache.has(key)) {
				key = cache.get(key);
			} else {
				const ret = humanizeString(key);

				if (key.length < 100) { // Prevent abuse
					cache.set(key, ret);
				}

				key = ret;
			}
		}

		return [key, value];
	}, {deep: options.deep});
};

module.exports = (input, options) => {
	if (Array.isArray(input)) {
		return Object.keys(input).map(key => humanizeConvert(input[key], options));
	}

	return humanizeConvert(input, options);
};

