import HEML, { HEMLNode, HEMLElementContainsText } from '@heml/render'; // eslint-disable-line no-unused-vars
import { transforms } from '@heml/utils';

export class Table extends HEMLElementContainsText {
	protected attrs = true as true;
	public rules = {
		'.table': [{ '@pseudo': 'root' }, '@default', { display: transforms.trueHide('table') }],
	};

	public render(): HEMLNode {
		const { contents, ...props } = this.props;
		props.class += ' table';

		return <table {...props}>{contents}</table>;
	}
}

export class Tr extends HEMLElementContainsText {
	protected attrs = true as true;
	public rules = {
		'.tr': [{ '@pseudo': 'root' }, '@default'],
	};

	public render(): HEMLNode {
		const { contents, ...props } = this.props;
		props.class += ' tr';

		return <tr {...props}>{contents}</tr>;
	}
}

export class Td extends HEMLElementContainsText {
	protected attrs = true as true;
	public rules = {
		'.td': [{ '@pseudo': 'root' }, '@default'],
	};

	public render(): HEMLNode {
		const { contents, ...props } = this.props;
		props.class += ' td';
		return <td {...props}>{contents}</td>;
	}
}