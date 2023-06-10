import { CommandInteraction } from "discord.js";
import { Discord, Slash } from "discordx";

@Discord()
export class ListEmojisCommand {
	@Slash({
		name: "listemojis",
		description: "listemojis"
	})
	async listemojis(interaction: CommandInteraction): Promise<void> {
		if (interaction.guild) {
			const {
				guild: { emojis }
			} = interaction;
			interaction.reply(
				emojis.cache
					.map((emoji) => `${emoji} | \\${emoji} | ${emoji.name} | ${emoji.id}`)
					.join("\n")
			);
		}
	}
}
