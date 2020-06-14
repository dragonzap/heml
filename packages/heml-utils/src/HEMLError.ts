import { min, max } from 'lodash';
import { Cheerio, CheerioElement } from 'cheerio';

export class HEMLError extends Error {
	public $node: Cheerio;
	public selector: string;

	public constructor(message: string, $node: Cheerio) {
		super(message);
		this.name = 'HEMLError';

		if ($node) {
			this.$node = $node;
			this.selector = buildExactSelector($node);
		}

		Error.captureStackTrace(this, HEMLError);
	}
}

function buildExactSelector($node: Cheerio): string {
	const nodeSelector = buildSelector($node[0]);
	const strSelector = $node
		.parents()
		.toArray()
		.map((node) => buildSelector(node))
		.reverse()
		.concat([nodeSelector])
		.join(' > ');

	const chopAfter = min(max(0, strSelector.lastIndexOf('#')), max(0, strSelector.lastIndexOf('html')), max(0, strSelector.lastIndexOf('heml')));

	return strSelector.substr(chopAfter);
}

function buildSelector(node: CheerioElement): string {
	if (node.attribs.id) {
		return `#${node.attribs.id}`;
	}

	const tag = node.tagName.toLowerCase();
	const siblingsBefore = findSiblingsBefore(node);
	const siblingsAfter = findSiblingsAfter(node);
	const siblings = siblingsBefore.concat(siblingsAfter);

	const sameTag = siblings.filter((s) => s.tagName.toLowerCase() === tag);

	if (siblings.length === 0 || sameTag.length === 0) {
		return tag;
	}

	const sameTagAndClass = siblings.filter((s) => s.attribs.className === node.attribs.className && s.tagName.toLowerCase() === tag);

	if (node.attribs.className && sameTagAndClass.length === 0) {
		return `${tag}.${node.attribs.className.split(' ').join('.')}`;
	}

	return `${tag}:nth-child(${siblingsBefore.length + 1})`;
}

function findSiblingsBefore(node: CheerioElement, siblings: CheerioElement[] = []): CheerioElement[] {
	if (!node.previousSibling) {
		return siblings;
	}

	if (node.previousSibling.tagName) {
		siblings = siblings.concat([node.previousSibling]);
	}

	return findSiblingsBefore(node.previousSibling, siblings);
}

function findSiblingsAfter(node: CheerioElement, siblings: CheerioElement[] = []): CheerioElement[] {
	if (!node.nextSibling) {
		return siblings;
	}

	if (node.nextSibling.tagName) {
		siblings = siblings.concat([node.nextSibling]);
	}

	return findSiblingsAfter(node.nextSibling, siblings);
}
