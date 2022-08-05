// https://api.urbandictionary.com/v0/define?term=
// https://api.urbandictionary.com/v0/random

import {
	ApplicationCommandOptionType,
	CommandInteraction,
    EmbedBuilder
} from "discord.js";

import { Discord, Slash, SlashGroup, SlashOption } from "discordx";

import { makeRequestJ } from "../util/request.js";
import { EmbedUtil } from "../util/embed.js";

const URBAN_API_BASE = process.env.URBAN_API_BASE || "https://api.urbandictionary.com/v0/define?term=";
const URBAN_RANDOM = process.env.URBAN_RANDOM || "https://api.urbandictionary.com/v0/random";
const URBAN_DEFINE_BASE = process.env.URBAN_DEFINE_BASE || "https://urbandictionary.com/define.php?term=";

@Discord()
@SlashGroup({ name: "urban", description: "Urban dictionary" })
@SlashGroup("urban")
export class UrbanCommand {
    @Slash("define")
	async urban(
		@SlashOption("word", { type: ApplicationCommandOptionType.String })
		word: string,
		interaction: CommandInteraction
	): Promise<void> {
        await interaction.deferReply();

        const {status, data} = await makeRequestJ(URBAN_API_BASE + encodeURIComponent(word));
        
        if(status == 200) {
            const {list} = data;
            if(list.length > 1) {
                await interaction.editReply({ embeds: [this.makeDefinition(list[0])] });
            } else await interaction.editReply(`❌ No definitions found for '${word}'!`);
        } else await interaction.editReply({
            embeds: [EmbedUtil.unexpected(data)]});
	}

    @Slash("random")
    async random(
        interaction: CommandInteraction
    ): Promise<void> {
        await interaction.deferReply();

        const {status, data} = await makeRequestJ(URBAN_RANDOM);
        
        if(status == 200) {
            const {list} = data;
            if(list.length > 1) {
                await interaction.editReply({ embeds: [this.makeDefinition(list[0])] });
            }
        } else await interaction.editReply({
            embeds: [EmbedUtil.unexpected(data)]});
    }

    transformDefinition(content: string): string {
        const replace_re = /\[([a-zA-Z0-9-,' ]+)\]/g;

        let last = 0, result = "";

        for(const match of content.matchAll(replace_re)) {
            result += content.slice(last, match.index);
            result += `[${match[1]}](${URBAN_DEFINE_BASE}${encodeURIComponent(match[1])})`
            last = match.index as number + match[0].length;
        }

        result += content.slice(last, content.length);

        return EmbedUtil.escape(result);
    }

    makeDefinition(_definition: any): EmbedBuilder {
        const {definition, permalink, thumbs_up, thumbs_down, author, example, word} = _definition;

        let _content = this.transformDefinition(definition),
            _example = example ? "\n\n" + this.transformDefinition(example).split("\n").map(l=>"> " + l).join("\n") : "",
            _rating = `\n\n${thumbs_up} 👍 ${thumbs_down} 👎`;

        if(_content.length + _example.length + _rating.length >= 4096)
            _content = _content.slice(0, 4096 - _example.length - _rating.length - 3) + "...";

        return EmbedUtil.newBuilder()
            .setFooter({ iconURL: EmbedUtil.FOOTER_ICON_URL, text: `Definition by ${author}` })
            .setDescription(_content + _example + _rating)
            .setColor("Blurple")
            .setThumbnail("https://i.imgur.com/VFXr0ID.jpg")
            .setURL(permalink)
            .setTitle(word);
    }
}
