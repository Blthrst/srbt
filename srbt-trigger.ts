import { TelegramClient } from "@mtcute/node";

import { ISrbtTrigger } from "../types/interfaces";
import { SrbtTriggerOptions, UpdateTypes, UpdateType } from "../types/types";
import Logger from "./logger";

export class SrbtBaseTrigger implements ISrbtTrigger {
  private trigger: string;
  private updateType: UpdateTypes;
  private logger: Logger = new Logger()
  constructor(opts: SrbtTriggerOptions) {
    this.trigger = opts.trigger;
    this.updateType = opts.updateType;
  }

  getTrigger() {
    return this.trigger;
  }

  getUpdateType() {
    return this.updateType;
  }

  async action(
    tg: TelegramClient,
    upd: UpdateType
  ): Promise<void> {
    this.logger.log(`No action was set for ${this.constructor.name}`, "red");
  }
}
