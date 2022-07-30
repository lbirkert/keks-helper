import axios from "axios";
import {
	ApplicationCommandOptionType,
	CommandInteraction
} from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";

import { EmbedUtil } from "../util/embed.js";

@Discord()
export class ListEmojisCommand {
	@Slash("listemojis")
	async listemojis(
		interaction: CommandInteraction
	): Promise<void> {
        if(interaction.guild) {
            const {guild: {emojis}} = interaction;
            interaction.reply(emojis.cache.map(emoji => `${emoji} | \\${emoji} | ${emoji.name} | ${emoji.id}`).join("\n"));
        }
	}
}
