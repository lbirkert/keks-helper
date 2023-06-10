// https://api.dictionaryapi.dev/api/v2/entries/en/

import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";

import { Discord, Slash, SlashOption } from "discordx";

import { makeRequest, makeRequestJ } from "../util/request.js";
import { EmbedUtil } from "../util/embed.js";

@Discord()
export class DictionaryCommand {
	@Slash({
		name: "define",
		description: "define"
	})
	@Slash({
		name: "dictionary",
		description: "dictionary"
	})
	async dictionary(
		@SlashOption({
			name: "word",
			description: "word",
			type: ApplicationCommandOptionType.String,
			required: true
		})
		word: string,
		interaction: CommandInteraction
	): Promise<void> {
		await interaction.deferReply();

		const { status, data } = await makeRequestJ(
			"https://api.dictionaryapi.dev/api/v2/entries/en/" + encodeURIComponent(word)
		);

		if (status === 200) {
			const embed = EmbedUtil.newBuilder().setColor("Blurple").setTitle("Dictionary");

			const _files = [];
			const _meanings: { [key: string]: any } = {};
			const _sourceUrls = new Set<string>();
			const _words = new Set<string>();
			const _phonetics = new Set<string>();
			const _audios = new Set<string>();

			for (const { word, sourceUrls, phonetics, meanings } of data) {
				for (const { audio, text } of phonetics) {
					if (text) _phonetics.add(text);
					if (audio && !_audios.has(audio)) {
						_audios.add(audio);

						console.log("Fetching", audio);

						const { status, data } = await makeRequest(audio, true);
						if (status == 200)
							_files.push({
								attachment: data,
								name: "pronounce.mp3",
								description: text
							});
					}
				}

				for (const { partOfSpeech, definitions, synonyms, antonyms } of meanings) {
					const meaning = _meanings[partOfSpeech];
					if (meaning) {
						meaning.definitions.push(...definitions);
						meaning.synonyms.push(...synonyms);
						meaning.antonyms.push(...antonyms);
					} else _meanings[partOfSpeech] = { definitions, synonyms, antonyms };
				}

				sourceUrls.forEach((u: string) => _sourceUrls.add(u));
				_words.add(word);
			}

			embed.setTitle(`Dictionary | ${[..._words].join(", ")}`).setDescription(`${[
				..._phonetics
			].join("   ")}\n\n\
                    Sources:\n${[..._sourceUrls].map((u) => `[${u}](${u})`).join("\n")}`);

			Object.entries(_meanings).forEach(([k, { definitions }]) => {
				let _definitions = definitions
					.map((_definition: { definition: string; example: string | undefined }) => {
						var { definition, example } = _definition;
						if (example) definition += `\n> *${example}*`;
						return definition;
					})
					.join("\n\n");

				if (_definitions.length >= 1024) _definitions = _definitions.slice(0, 1021) + "...";

				embed.addFields({
					name: k,
					value: _definitions
				});
			});

			await interaction.editReply({
				embeds: [embed],
				files: _files
			});
		} else if (status == 404) {
			await interaction.editReply(`❌ '${word}' was not found in dictionary!`);
		} else
			await interaction.editReply({
				embeds: [EmbedUtil.unexpected(data)]
			});
	}
}
