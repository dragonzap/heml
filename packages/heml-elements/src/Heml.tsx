import type { HEMLAttributes, HEMLNode, HEMLGlobals } from '@dragonzap/heml-render';
import HEML, { HEMLElement } from '@dragonzap/heml-render'; // eslint-disable-line no-unused-vars

interface Attrs extends HEMLAttributes {
	lang?: string;
	xmlns?: string;
	'xmlns:v'?: string;
	'xmlns:o'?: string;
}

export class Heml extends HEMLElement<Attrs> {
	protected unique = true;
	protected parent = [];
	protected children = ['head', 'body'];
	protected static readonly defaultProps = {
		lang: 'en',
		xmlns: 'http://www.w3.org/1999/xhtml',
		'xmlns:v': 'urn:schemas-microsoft-com:vml',
		'xmlns:o': 'urn:schemas-microsoft-com:office:office',
	};

	public render(globals: HEMLGlobals): HEMLNode {
		const { contents, ...props } = this.props;
		return [
			`<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">`,
			<html {...props}>{contents}</html>,
		];
	}
}
