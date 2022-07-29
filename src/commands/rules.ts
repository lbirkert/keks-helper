import {
    ActionRowBuilder,
	ApplicationCommandOptionType,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	CommandInteraction,
	GuildMember,
	GuildMemberRoleManager,
	Message,
	MessageActionRowComponentBuilder,
	PermissionsBitField,
	Role,
	TextChannel,
	User
} from "discord.js";
import { Discord, Slash, SlashOption, ButtonComponent } from "discordx";

import { EmbedUtil } from "../util/embed.js";
import { awaitMessage } from '../util/message.js';

@Discord()
export class RulesCommand {
	@Slash("rules")
	async rules(
		@SlashOption("role", { type: ApplicationCommandOptionType.Role })
		role: Role,
		interaction: CommandInteraction
	): Promise<void> {
		if (interaction.member) {
			const permissions = interaction.member.permissions as Readonly<PermissionsBitField>;
			const no_permissions = EmbedUtil.checkPermissions(permissions, "Administrator");
			if (!no_permissions) {
				const { channel, user } = interaction;
				if (channel instanceof TextChannel) {
					await interaction.reply({
						content: "Please enter the text you want to use as rules",
						ephemeral: true
					});
					
                    try {
                        const message = await awaitMessage(channel, user.id, 120_000);
    
                        const acceptBtn = new ButtonBuilder()
                            .setEmoji("✅")
                            .setLabel("Accept")
                            .setStyle(ButtonStyle.Primary)
                            .setCustomId("rules-accept-" + role.id);
    
                        const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                            acceptBtn
                        );
    
                        const embed = EmbedUtil.newBuilder({ footer: true });
                        embed.setTimestamp(undefined)
                            .setColor("Blurple")
                            .setTitle("Rules")
                            .setDescription(message.content);
    
                        channel.send({
                            embeds: [embed],
                            components: [row]
                        });
    
                        message.delete();
                    } catch(e) {
                        interaction.editReply("Canceled");
                    }
				}
			} else
				interaction.reply({
					embeds: [no_permissions],
					ephemeral: true
				});
		}
	}

	@ButtonComponent(/rules-accept-[0-9]+/)
	async rulesAcceptBtn(interaction: ButtonInteraction): Promise<void> {
		if (interaction.guild && interaction.member) {
			const role_id = interaction.customId.slice(13);

			const roles = interaction.member.roles as GuildMemberRoleManager;
			if (roles.cache.has(role_id)) {
				await roles.remove(role_id);
				await interaction.reply({ content: `Rejected the Rules.`, ephemeral: true });
			} else {
				await roles.add(role_id);
				await interaction.reply({ content: `Accepted the Rules.`, ephemeral: true });
			}
		}
	}
}
