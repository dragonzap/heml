import HEML, { HEMLNode, HEMLElement } from "@dragonzap/heml-render"; // eslint-disable-line no-unused-vars
import { Meta } from "./Meta";

export class Preview extends HEMLElement {
  protected parent = ["head"];
  protected unique = true;

  public render(): HEMLNode {
    Meta.set("preview", this.props.contents + "");

    return undefined;
  }

  public static async flush(): Promise<string> {
    const preview = Meta.get("preview");

    return Promise.resolve(
      preview ? (
        <div
          class="preview"
          style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;"
        >
          {preview}
          {"&nbsp;&zwnj;".repeat(200 - preview.length)}
        </div>
      ) : (
        ""
      )
    );
  }
}
