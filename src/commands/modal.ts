import {
	TextInputBuilder,
	ButtonStyle,
	CommandInteraction,
	ModalBuilder,
	ActionRowBuilder,
	TextInputStyle
} from "discord.js";
import { Discord, Slash, SlashChoice, SlashOption } from "discordx";

@Discord()
export class Example {
	@Slash("modal")
	async modal(interaction: CommandInteraction): Promise<void> {
		const menuFinishBtn = new TextInputBuilder()
			.setLabel("Amogus")
			.setPlaceholder("I found amogus I found amogus I found amogus I found amogus")
			.setStyle(TextInputStyle.Paragraph)
			.setCustomId("menu-finish");

		const menuCancelBtn = new TextInputBuilder()
			.setLabel("Amongus")
			.setPlaceholder("I found amongus I found amongus I found amongus")
			.setStyle(TextInputStyle.Short)
			.setCustomId("menu-cancel");

		const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(menuFinishBtn);
		const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(menuCancelBtn);

		const modal = new ModalBuilder()
			.setTitle("Among Us?")
			.setCustomId("example-modal")
			.addComponents(firstActionRow, secondActionRow);

		await interaction.showModal(modal);
	}
}
