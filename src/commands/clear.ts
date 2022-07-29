import {
	ApplicationCommandOptionType,
	CommandInteraction,
	GuildMember,
	Message,
	PermissionsBitField,
	TextChannel,
	User
} from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";

import { EmbedUtil } from "../util/embed.js";

@Discord()
export class ClearCommand {
	@Slash("clear")
	async clear(
		@SlashOption("amount", { type: ApplicationCommandOptionType.Integer })
		amount: number,
		@SlashOption("author", { type: ApplicationCommandOptionType.User, required: false })
		author: User | GuildMember | undefined,
		interaction: CommandInteraction
	): Promise<void> {
		if (interaction.member) {
			const permissions = interaction.member.permissions as Readonly<PermissionsBitField>;
			const no_permissions = EmbedUtil.checkPermissions(permissions, "ManageMessages");
			if (!no_permissions) {
				if (amount > 0) {
					const { channel } = interaction;
					if (channel instanceof TextChannel) {
                        await interaction.deferReply({ ephemeral: true });

						const messageDict = await channel.messages
							.fetch({ limit: author ? undefined : amount, cache: false })
							
                        if (author) {
                            var messages: Message<boolean>[] = [];
                            for (let msg of messageDict.values()) {
                                if (messages.length >= amount) break;
                                if (msg.author.id == author.id) messages.push(msg);
                            }
                        } else var messages: Message<boolean>[] = [...messageDict.values()];

                        await channel.bulkDelete(messages, true);

                        await interaction.editReply({
                            content: `Sucessfully deleted ${messages.length} message${
                                messages.length == 1 ? "" : "s"
                            }!`
                        });
					}
				} else
					interaction.reply({
						content: "Parameter 'amount' needs to be greater than 0.",
						ephemeral: true
					});
			} else
				interaction.reply({
					embeds: [no_permissions],
					ephemeral: true
				});
		}
	}
}
