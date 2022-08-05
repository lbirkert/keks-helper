import { EmbedBuilder, PermissionResolvable, PermissionsBitField } from "discord.js";

export namespace EmbedUtil {
	export const FOOTER_ICON_URL = process.env.FOOTER_ICON_URL || 
		"https://cdn.discordapp.com/avatars/874339646044262473/aa5eec25594728a925cec3bcd9648720.webp";

	export type EssentialOptions = {
		footer?: boolean;
		timestamp?: boolean;
	};

	export function checkPermissions(
		permissions: Readonly<PermissionsBitField>,
		permission: PermissionResolvable
	): EmbedBuilder | void {
		if (!permissions.has(permission)) {
			const builder = newBuilder();

			builder.setColor("Red");
			builder.setTitle(`Missing Permission${permission instanceof Array ? "s" : ""}`);
			builder.setDescription(
				`\`${permission instanceof Array ? permission.join("`\n `") : permission}\``
			);
			return builder;
		}
	}

	export function newBuilder(options?: EssentialOptions): EmbedBuilder {
		const builder = new EmbedBuilder();
		addEssential(builder, options);
		return builder;
	}

	export function addEssential(builder: EmbedBuilder, options?: EssentialOptions) {
		if (options?.footer != false) {
			builder.setFooter({
				iconURL: FOOTER_ICON_URL,
				text: `by KekOnTheWorld`
			});
		}

		if (options?.timestamp != false) builder.setTimestamp(new Date());
	}

	export function unexpected(content: string): EmbedBuilder {
		console.error("An unexpected error occured:", content);

		return newBuilder()
			.setTitle("Yikes")
			.setColor("DarkRed")
			.setDescription(`An unexpected Error occured\n\n\`\`\`${escape(content)}\`\`\``)
	}

	export function escape(content: string): string {
		return content
			.replace(/\\/g, "\\\\")
			.replace(/`/g, "\\`")
			.replace(/\*/g, "\\*")
			.replace(/\|\|/g, "\\||")
			.replace(/__/g, "\\__")
			.replace(/~/g, "\\~")
			.replace(/>/g, "\\>");
	}
}
