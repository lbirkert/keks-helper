import type { ArgsOf, Client } from "discordx";
import { Discord, On } from "discordx";

@Discord()
export class Example {
	@On({ event: "messageDelete" })
	onMessage([message]: ArgsOf<"messageDelete">, client: Client): void {
		console.log("Message Deleted", client.user?.username, message.content);
	}
}
