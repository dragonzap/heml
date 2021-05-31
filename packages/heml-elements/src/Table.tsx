/* eslint-disable max-classes-per-file */
import type { HEMLNode, HEMLGlobals } from '@dragonzap/heml-render';
import HEML, { HEMLElementContainsText } from '@dragonzap/heml-render'; // eslint-disable-line no-unused-vars
import { transforms } from '@dragonzap/heml-utils';

export class Table extends HEMLElementContainsText {
	protected attrs = true as const;
	public rules: Record<string, any[]> = {
		'.table': [{ '@pseudo': 'root' }, '@default', { display: transforms.trueHide('table') }],
	};

	public render(globals: HEMLGlobals): HEMLNode {
		const { contents, ...props } = this.props;
		props.class += ' table';

		return <table {...props}>{contents}</table>;
	}
}

export class Tr extends HEMLElementContainsText {
	protected attrs = true as const;
	public rules = {
		'.tr': [{ '@pseudo': 'root' }, '@default'],
	};

	public render(globals: HEMLGlobals): HEMLNode {
		const { contents, ...props } = this.props;
		props.class += ' tr';

		return <tr {...props}>{contents}</tr>;
	}
}

export class Td extends HEMLElementContainsText {
	protected attrs = true as const;
	public rules = {
		'.td': [{ '@pseudo': 'root' }, '@default'],
	};

	public render(globals: HEMLGlobals): HEMLNode {
		const { contents, ...props } = this.props;
		props.class += ' td';
		return <td {...props}>{contents}</td>;
	}
}
