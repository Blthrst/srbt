import { TelegramClient, User } from "@mtcute/node";
import {
  convertFromGramjsSession,
  convertFromPyrogramSession,
  convertFromMtkrutoSession,
  convertToTelethonSession,
} from "@mtcute/convert";

import {
  SessionType,
  SrbtOptions,
  UpdateTypes,
} from "../types/types";
import Logger from "./logger";
import { ISrbtModule, ISrbtTrigger } from "../types/interfaces";

export class Srbt {
  private logger: Logger = new Logger();
  private tg: TelegramClient;
  private sessionType: SessionType;
  private sessionString: string;
  private getSession: boolean;
  private modules: Map<string, ISrbtModule> = new Map();

  private tree: Map<UpdateTypes, Map<string, ISrbtTrigger>> = new Map();

  constructor(opts: SrbtOptions) {
    this.tg = new TelegramClient(opts);
    this.sessionString = opts.sessionString ?? "";
    this.getSession = opts.getSession ?? false;
    this.sessionType = opts.sessionType ?? "Mtcute";

  }

  bind(modules: ISrbtModule[]): this {
    for (const m of modules) {
      this.modules.set(m.name, m);
    }

    return this;
  }

  async start() {
    this.logger.log("Starting bot...");
    if (this.sessionString) {
      switch (this.sessionType) {
        case "GramJS":
          await this.tg.importSession(
            convertFromGramjsSession(this.sessionString)
          );
          break;
        case "MTKruto":
          await this.tg.importSession(
            convertFromMtkrutoSession(this.sessionString)
          );
          break;
        case "TelethonV1":
          await this.tg.importSession(
            convertToTelethonSession(this.sessionString)
          );
          break;
        case "Pyrogram":
          await this.tg.importSession(
            convertFromPyrogramSession(this.sessionString)
          );
          break;
        case "Mtcute":
          await this.tg.importSession(this.sessionString);
          break;
        default:
          process.exit(0);
      }
      await this.tg.start();
      await this.setup();

      if (this.getSession) await this.logSession();
      return;
    }

    this.tg.run(
      {
        phone: () =>
          this.tg.input(this.logger.brush("Your phone number > ", "yellow")),
        code: () =>
          this.tg.input(this.logger.brush("Code from Telegram > ", "yellow")),
        password: () =>
          this.tg.input(this.logger.brush("Your password > ", "yellow")),
      },
      async (self: User) => {
        this.logger.log(`Logged in as ${self.displayName}`);
        await this.setup();
        if (this.getSession) await this.logSession();
      }
    );
  }

  private async setup(): Promise<void> {
    this.modules.forEach((m: ISrbtModule) => {
      for (const t of m.getTriggers()) {
        this.tree.set(t.getUpdateType(), new Map());
      }
    });

    this.modules.forEach((m: ISrbtModule) => {
      for (const t of m.getTriggers()) {
        const updType = t.getUpdateType();
        const trigger = t.getTrigger();

        this.tree.get(updType)?.set(trigger, t);

        this.tree.get(updType)?.has(trigger)
          ? this.logger.log(
              `"${trigger}" trigger was succesfully set for "${updType}" update type. Module - ${m.name}`,
              "green"
            )
          : this.logger.log(
              `Failed to set "${trigger}" for ${updType} update type. Module - ${m.name}`,
              "red"
            );
      }
    });

    this.tree.forEach((triggersMap, updType) => {
      triggersMap.forEach((t) => {
        this.tg.on(updType, (upd) => {
          t.action(this.tg, upd);
        });
      });
    });

    this.logger.log("Setup completed succesfully", "green");
  }

  async logSession(): Promise<void> {
    this.logger.log(
      `\nYour Mtcute session string: ${await this.tg.exportSession()}`,
      "yellow"
    );
  }
}
