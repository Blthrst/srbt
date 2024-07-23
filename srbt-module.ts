import { SrbtModuleOptions } from "../types/types";
import { ISrbtTrigger, ISrbtModule } from "../types/interfaces";
import Logger from "./logger";

export class SrbtModule implements ISrbtModule {
  public name: string;
  public author: string;
  public version: string;
  public github: string;
  public description: string;
  private logger: Logger = new Logger();
  private _triggers: ISrbtTrigger[];

  constructor(opts: SrbtModuleOptions) {
    this.name = opts.name;
    this.author = opts?.author ?? "";
    this.version = opts?.version ?? "1.0.0";
    this.github = opts?.github ?? "https://github.com/Blthrst";
    this.description = opts?.description ?? "";
    this._triggers = [];
  }

  public getTriggers() {
    return this._triggers;
  }

  bind(triggers: ISrbtTrigger[]): this {
    this._triggers = [...triggers];

    return this;
  }

  disband(triggerClass?: ISrbtTrigger): this {
    if (triggerClass) {
      const trigger = this.findTrigger(triggerClass);
      trigger
        ? this._triggers.splice(this._triggers.indexOf(trigger), 1)
        : this.logger.log(
            `Instance of ${triggerClass.constructor.name} not found`,
            "red"
          );

      return this;
    }
    this._triggers = [];

    return this;
  }

  findTrigger(triggerClass: ISrbtTrigger): ISrbtTrigger | undefined {
    const foundTrigger = this._triggers.find(
      (t) =>
        t.constructor.name === triggerClass.constructor.name &&
        typeof t.constructor === "function"
    );

    return foundTrigger;
  }
}
