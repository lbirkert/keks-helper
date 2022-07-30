import axios from "axios";
import {
	ApplicationCommandOptionType,
	CommandInteraction
} from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";

import { EmbedUtil } from "../util/embed.js";

@Discord()
export class JokeCommand {
	@Slash("joke")
	async joke(
		@SlashOption("blacklist", { type: ApplicationCommandOptionType.String, required: false })
		blacklist: string | undefined,
		interaction: CommandInteraction
	): Promise<void> {
		await interaction.deferReply();

		const params = new URLSearchParams();
		if (blacklist) params.set("blacklist", blacklist);

		const content = await axios.get("https://v2.jokeapi.dev/joke/Any?" + params);

		if(content.status === 200) {
            const {data: {type, flags}, data} = content;
            const flagged_for = Object.entries(flags).filter(([_, v])=>v).map(([k, _])=>k);

            const safe = flagged_for.length === 0;
            
            const flagged_for_text = safe?"":`Might be *${flagged_for.join("*, *")}\*\n\n`;

            const embed = EmbedUtil.newBuilder()
                .setColor("Blurple")
                .setTitle("Joke");
            
            if(type === "single") {
                embed.setTitle(flagged_for_text + this.makeSafe(safe, data.joke));
                await interaction.editReply({ embeds: [embed] });
            } else {
                const setup = flagged_for_text + this.makeSafe(safe, data.setup);

                embed.setTitle(setup + "\n<a:loading:1002989855225159790>");
                await interaction.editReply({ embeds: [embed] });

                await new Promise(r=>setTimeout(r, data.setup.length*100));

                embed.setTitle(setup + "\n\n" + this.makeSafe(safe, data.delivery));
                await interaction.editReply({ embeds: [embed] });
            }
        }
	}

    makeSafe(safe: boolean, text: string) {
        return safe?text:`||${text}||`
    }
}
