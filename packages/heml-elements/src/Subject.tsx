import HEML, { HEMLNode, HEMLElement } from "@dragonzap/render"; // eslint-disable-line no-unused-vars
import { Meta } from "./Meta";

export class Subject extends HEMLElement {
  protected parent = ["head"];
  protected unique = true;

  public render(): HEMLNode {
    Meta.set("subject", this.props.contents + "");

    return undefined;
  }

  public static async flush(): Promise<string> {
    return new Promise((resolve) => resolve(Meta.get("subject") || ""));
  }
}
