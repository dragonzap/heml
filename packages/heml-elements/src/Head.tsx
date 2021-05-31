import type { HEMLNode, HEMLGlobals } from '@dragonzap/heml-render';
import HEML, { HEMLElement } from '@dragonzap/heml-render'; // eslint-disable-line no-unused-vars
import { Style } from './Style';
import { Subject } from './Subject';

export class Head extends HEMLElement {
	protected unique = true;
	protected parent = ['heml'];
	protected attrs = [];

	public render(globals: HEMLGlobals): HEMLNode {
		const { contents, ...props } = this.props;

		return (
			<head {...props}>
				<meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
				{`<!--[if !mso]><!-->`}
				<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
				{`<!--<![endif]-->`}
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<meta name="x-apple-disable-message-reformatting" />
				<meta name="format-detection" content="telephone=no" />
				<style type="text/css" data-embed>
					{this.getEmbedCss()}
				</style>
				<style type="text/css">
					{`
					h1, h2, h3, h4, h5, h6 { display:block;padding:0;margin:20px 0; }
					h1 { line-height: 40px; }
					h2 { line-height: 30px; }
					h3 { line-height: 24px; }
					h5 { line-height: 17px; }
					h6 { line-height: 12px; }
					p { display: block; margin: 14px 0; padding: 0; }
					ul { padding-left: 25px; margin-top: 16px; margin-bottom: 16px; margin-left: 0; list-style-type: disc; }
				`}
				</style>
				{`<!--[if gte mso 9]>
				<style type="text/css">
					ul { margin-left:0; padding-left: 0; }
					table td { border-collapse: collapse; }
				</style>
				<![endif]-->`}
				<title>{Subject.flush(globals)}</title>
				{Style.flush(globals)}
				{`<!-- content -->`}
				{contents}
				{`<!--[if gte mso 9]>
					<xml>
						<o:OfficeDocumentSettings>
							<o:AllowPNG/>
							<o:PixelsPerInch>96</o:PixelsPerInch>
						</o:OfficeDocumentSettings>
					</xml>
					<![endif]-->`}
			</head>
		);
	}

	private getEmbedCss(): string[] {
		return [
			'* { text-size-adjust: 100%; -ms-text-size-adjust: 100%; -moz-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }',
			'div[style*="margin: 16px 0"] { margin:0 !important; }',
			'.imageFix { display:block; }',
			'#bodyTable, #bodyCell { height:100% !important; margin:0; padding:0; width:100% !important; }',
			'table, td {border-collapse:collapse;border-spacing:0;}',
			'img, a img {border:0; height:auto; outline:none; text-decoration:none;}',
			'html, body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; mso-line-height-rule: exactly; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }',
			// CLIENT-SPECIFIC STYLES
			'img {-ms-interpolation-mode: bicubic;}', // Force IE to smoothly render resized images.
			'@-ms-viewport{width:device-width;}', // Force IE "snap mode" to render widths normally.
			'#outlook a {padding:0;}', // Force Outlook 2007 and up to provide a "view in browser" message.
			'table, td {mso-table-lspace:0pt; mso-table-rspace:0pt;}', // Remove spacing between tables in Outlook 2007 and up.
			'.ReadMsgBody {width:100%;} .ExternalClass {width:100%;}', // Force Outlook.com to display emails at full width.
			'p, a, td, li, blockquote {mso-line-height-rule:exactly;}', // Force Outlook to render line heights as they're originally set.
			'p, a, td, li, body, table, blockquote {-ms-text-size-adjust:100%; -webkit-text-size-adjust:100%;}', // Prevent Windows- and Webkit-based mobile platforms from changing declared text sizes.
			'.ExternalClass, .ExternalClass p, .ExternalClass td, .ExternalClass div, .ExternalClass span, .ExternalClass font {line-height:100%;}', // Force Outlook.com to display line heights normally.
			'a [x-apple-data-detectors] {color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important;}', // attempt to control apple deata detection
			'a[href^="tel"], a[href^="sms"]{color:inherit; cursor:default; text-decoration:none;} ', // Force mobile devices to inherit declared link styles.
			'a { text-decoration: none; word-wrap:break-word; }',
			'*[class="gmail"] { display: none !important }',
		];
	}
}
