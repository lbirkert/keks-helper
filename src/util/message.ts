import { Message, TextBasedChannel } from "discord.js";

export async function awaitMessage(
	channel: TextBasedChannel,
	author: string,
	time: number
): Promise<Message<boolean>> {
	const messages = await channel.awaitMessages({
		filter: (m) => m.author.id == author,
		time,
		errors: ["time"],
		max: 1
	});
	return messages.values().next().value;
}
