import { APIEmbed, EmbedBuilder, PermissionResolvable, PermissionsBitField } from "discord.js";

export namespace EmbedUtil {
	export type EssentialOptions = {
		footer?: boolean;
	};

	export function checkPermissions(
		permissions: Readonly<PermissionsBitField>,
		permission: PermissionResolvable
	): EmbedBuilder | void {
		if (!permissions.has(permission)) {
			const builder = newBuilder({ footer: true });

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
		if (options?.footer) {
			builder.setFooter({
				iconURL:
					"https://cdn.discordapp.com/avatars/874339646044262473/aa5eec25594728a925cec3bcd9648720.webp",
				text: `by KekOnTheWorld`
			});
		}

		builder.setTimestamp(new Date());
	}
}
