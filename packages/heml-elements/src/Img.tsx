import type { HEMLAttributes, HEMLNode, HEMLGlobals } from '@dragonzap/heml-render';
import HEML, { HEMLElement } from '@dragonzap/heml-render'; // eslint-disable-line no-unused-vars
import { transforms } from '@dragonzap/heml-utils';
import axios from 'axios';
import fs from 'fs-extra';
import { imageSize } from 'image-size';
import isAbsoluteUrl from 'is-absolute-url';
import has from 'lodash/has';
import omit from 'lodash/omit';
import { Style } from './Style';

interface Attrs extends HEMLAttributes {
	src?: string;
	width?: string;
	height?: string;
	alt?: string;
	infer?: string | boolean;
	inline?: string;
	style?: string;
	border?: string;
}

export class Img extends HEMLElement<Attrs> {
	protected attrs = ['src', 'width', 'height', 'alt', 'infer', 'inline', 'style'];
	protected children = false;
	protected static readonly defaultProps = {
		border: '0',
		alt: '',
	};
	public rules: Record<string, any[]> = {
		img: [{ '@pseudo': 'root' }, { display: transforms.trueHide() }, '@default'],
	};

	public render(globals: HEMLGlobals): HEMLNode {
		const { contents, ...props } = this.props;

		const isBlock = !props.inline;

		if (!!props.infer && has(props, 'src') && !props.width) {
			props.width = getWidth(props.src, props.infer === 'retina');
		}

		props.class += ` ${isBlock ? 'img__block' : 'img__inline'}`;
		props.style = isBlock ? '' : 'display: inline-block;';

		return [
			<img {...omit(props, 'inline', 'infer')} />,
			<Style for="img">{`
        .img__block {
          display: block;
          max-width: 100%;
        }
      `}</Style>,
		];
	}
}

function getWidth(path: string, isRetina: boolean): string {
	try {
		const image = isAbsoluteUrl(path) ? getRemoteBuffer(path) : fs.readFileSync(path);

		const { width } = imageSize(image);
		if (!width) {
			return 'auto';
		}

		return String(isRetina ? Math.round(width / 2) : width);
	} catch (e) {
		return 'auto'; // if we fail fall back to auto
	}
}

async function getRemoteBuffer(path: string): Promise<Buffer> {
	const response = await axios.get(path, {
		responseType: 'arraybuffer',
	});
	return Buffer.from(response.data, 'binary');
}
