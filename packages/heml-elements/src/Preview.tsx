import HEML, { HEMLNode, HEMLElement, HEMLGlobals } from '@dragonzap/heml-render'; // eslint-disable-line no-unused-vars
import { Meta } from './Meta';

export class Preview extends HEMLElement {
	protected parent = ['head'];
	protected unique = true;

	public render(globals: HEMLGlobals): HEMLNode {
		Meta.set('preview', `${this.props.contents}`, globals);

		return undefined;
	}

	public static async flush(globals: HEMLGlobals): Promise<string> {
		const preview = Meta.get('preview', globals);

		return Promise.resolve(
			preview ? (
				<div
					className="preview"
					style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
					{preview}
					{'&nbsp;&zwnj;'.repeat(200 - preview.length)}
				</div>
			) : (
				''
			),
		);
	}
}
