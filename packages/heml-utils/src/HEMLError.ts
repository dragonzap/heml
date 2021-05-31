import max from 'lodash/max';
import min from 'lodash/min';

export class HEMLError extends Error {
	public $node: cheerio.Cheerio;
	public selector: string;

	public constructor(message: string, $node: cheerio.Cheerio) {
		super(message);
		this.name = 'HEMLError';

		if ($node) {
			this.selector = buildExactSelector($node);
		}

		Error.captureStackTrace(this, HEMLError);
	}
}

function buildExactSelector($node: cheerio.Cheerio): string {
	const nodeSelector = buildSelector($node[0]);
	const strSelector = $node
		.parents()
		.toArray()
		.map((node) => buildSelector(node))
		.reverse()
		.concat([nodeSelector])
		.join(' > ');

	const chopAfter = min(
		max(0, strSelector.lastIndexOf('#')),
		max(0, strSelector.lastIndexOf('html')),
		max(0, strSelector.lastIndexOf('heml')),
	);

	return strSelector.substr(chopAfter);
}

function buildSelector(node: cheerio.Element): string {
	if (node.type !== 'tag') {
		return '';
	}

	if (node.attribs.id) {
		return `#${node.attribs.id}`;
	}

	const tag = node.tagName.toLowerCase();
	const siblingsBefore = findSiblingsBefore(node);
	const siblingsAfter = findSiblingsAfter(node);
	const siblings = siblingsBefore.concat(siblingsAfter);

	const sameTag = siblings.filter((s) => s.type === 'tag' && s.tagName.toLowerCase() === tag);

	if (siblings.length === 0 || sameTag.length === 0) {
		return tag;
	}

	const sameTagAndClass = siblings.filter(
		(s) => s.type === 'tag' && s.attribs.className === node.attribs.className && s.tagName.toLowerCase() === tag,
	);

	if (node.attribs.className && sameTagAndClass.length === 0) {
		return `${tag}.${node.attribs.className.split(' ').join('.')}`;
	}

	return `${tag}:nth-child(${siblingsBefore.length + 1})`;
}

function findSiblingsBefore(node: cheerio.Element, siblings: cheerio.Element[] = []): cheerio.Element[] {
	if (node.type !== 'tag') {
		return [];
	}

	if (!node.previousSibling) {
		return siblings;
	}

	let newsiblings = siblings;
	if (node.previousSibling.type === 'tag' && node.previousSibling.tagName) {
		newsiblings = siblings.concat([node.previousSibling]);
	}

	return findSiblingsBefore(node.previousSibling, newsiblings);
}

function findSiblingsAfter(node: cheerio.Element, siblings: cheerio.Element[] = []): cheerio.Element[] {
	if (node.type !== 'tag') {
		return [];
	}

	if (!node.nextSibling) {
		return siblings;
	}

	let newsiblings = siblings;
	if (node.nextSibling.type === 'tag' && node.nextSibling.tagName) {
		newsiblings = siblings.concat([node.nextSibling]);
	}

	return findSiblingsAfter(node.nextSibling, newsiblings);
}
