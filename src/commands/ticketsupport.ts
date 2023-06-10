import {
	ApplicationCommandOptionType,
	GuildChannel,
	CommandInteraction,
	PermissionsBitField,
	TextChannel,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	MessageActionRowComponentBuilder,
	ButtonInteraction,
	CategoryChannel,
	ChannelType,
	Collection,
	OverwriteResolvable
} from "discord.js";
import { Discord, Slash, SlashOption, ButtonComponent } from "discordx";

import { awaitMessage } from "../util/message.js";
import { EmbedUtil } from "../util/embed.js";

import crypto from "crypto";

const ticketPermsAllow = new PermissionsBitField().add(
	"AddReactions",
	"UseExternalEmojis",
	"AttachFiles",
	"EmbedLinks",
	"SendMessages",
	"ViewChannel",
	"UseApplicationCommands",
	"UseExternalStickers"
);

const ticketPermsAllowObj: any = ticketPermsAllow
	.toArray()
	.reduce((p, v) => ((p[v] = true), p), {} as any);

@Discord()
export class TSCommand {
	@Slash({
		name: "ticketsupport",
		description: "ticketsupport"
	})
	async ticketsupport(
		@SlashOption({
			name: "category",
			description: "category",
			type: ApplicationCommandOptionType.Channel,
			required: true
		})
		category: GuildChannel,
		interaction: CommandInteraction
	): Promise<void> {
		if (interaction.member) {
			const permissions = interaction.member.permissions as Readonly<PermissionsBitField>;
			const no_permissions = EmbedUtil.checkPermissions(permissions, "Administrator");
			if (!no_permissions) {
				const { channel, user } = interaction;
				if (channel instanceof TextChannel) {
					await interaction.reply({
						content: "Please enter the text",
						ephemeral: true
					});

					try {
						const message = await awaitMessage(channel, user.id, 120_000);

						const openBtn = new ButtonBuilder()
							.setEmoji("🎫")
							.setLabel("Open")
							.setStyle(ButtonStyle.Primary)
							.setCustomId("ts-open-" + category.id);

						const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
							openBtn
						);

						const embed = EmbedUtil.newBuilder({ timestamp: false })
							.setColor("Blurple")
							.setTitle("Ticket Support")
							.setDescription(message.content);

						channel.send({
							embeds: [embed],
							components: [row]
						});

						message.delete();
					} catch (e) {
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

	@ButtonComponent({ id: /ts-open-[0-9]+/ })
	async tsOpenBtn(interaction: ButtonInteraction): Promise<void> {
		if (interaction.guild) {
			const { user, customId, guild } = interaction;

			await interaction.deferReply({ ephemeral: true });

			const category_id = customId.slice(8);

			const category = await guild.channels.fetch(category_id);

			if (category instanceof CategoryChannel) {
				const channel = await category.children.create({
					name: "ticket-" + crypto.randomBytes(4).toString("hex"),
					type: ChannelType.GuildText,
					topic: `${user}'s Support Ticket`,
					reason: `${user} opened a ticket`,
					permissionOverwrites: (
						category.permissionOverwrites.cache as Collection<string, OverwriteResolvable>
					).concat(
						new Collection<string, OverwriteResolvable>().set(user.id, {
							id: user.id,
							allow: ticketPermsAllow
						})
					)
				});

				const closeBtn = new ButtonBuilder()
					.setEmoji("❌")
					.setLabel("Close")
					.setStyle(ButtonStyle.Primary)
					.setCustomId("ts-close");

				const claimBtn = new ButtonBuilder()
					.setEmoji("🎫")
					.setLabel("Claim")
					.setStyle(ButtonStyle.Success)
					.setCustomId("ts-claim-" + user.id);

				const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
					closeBtn,
					claimBtn
				);

				const supporterRole = guild.roles.cache.find((r) => r.name === "Supporter");

				const embed = EmbedUtil.newBuilder({ footer: true })
					.setTimestamp(undefined)
					.setColor("Blurple")
					.setTitle("Ticket Support")
					.setDescription("Please wait until a Supporter Claims your ticket.");

				channel.send({
					content: `${user} ${supporterRole}`,
					embeds: [embed],
					components: [row]
				});

				await interaction.editReply(`Created your ticket here: ${channel}`);
			}
		}
	}

	@ButtonComponent({ id: /ts-claim-[0-9]+/ })
	async tsClaimBtn(interaction: ButtonInteraction): Promise<void> {
		if (interaction.channel instanceof TextChannel) {
			const { user, channel, customId, message } = interaction;

			const owner_id = customId.slice(9);

			if (owner_id !== user.id) {
				await interaction.deferReply();

				const embed = EmbedUtil.newBuilder({ footer: true })
					.setTimestamp(undefined)
					.setColor("Blurple")
					.setTitle("Ticket Support")
					.setDescription(`${user} is now handling this ticket.`);

				const components = message.components.map((c) => c.toJSON());
				components[0].components[1].disabled = true;

				await message.edit({ components });

				await interaction.editReply({ embeds: [embed] });

				await channel.permissionOverwrites.edit(user, ticketPermsAllowObj);
			} else await interaction.deferUpdate();
		}
	}

	@ButtonComponent({ id: "ts-close" })
	async tsCloseBtn(interaction: ButtonInteraction): Promise<void> {
		if (interaction.channel instanceof TextChannel) {
			const { user, channel, message } = interaction;

			if (channel.permissionOverwrites.cache.has(user.id)) {
				await interaction.deferReply();

				await message.edit({
					components: []
				});

				const embed = EmbedUtil.newBuilder({ footer: true })
					.setTimestamp(undefined)
					.setColor("Blurple")
					.setTitle("Ticket Support")
					.setDescription(`Ticket closed by ${user}`);

				await interaction.editReply({ embeds: [embed] });

				if (channel.parent)
					await channel.permissionOverwrites.set(channel.parent.permissionOverwrites.cache);

				await channel.setName(`solved-${channel.name.slice(7)}`);
			} else
				await interaction.reply({
					ephemeral: true,
					content: "❌ You have to claim the ticket before you can close it!"
				});
		}
	}
}
