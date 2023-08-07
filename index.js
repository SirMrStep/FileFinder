const { EmbedBuilder } = require('@discordjs/builders');
const { Client, IntentsBitField } = require('discord.js');
const { token } = require('./token.json');

const client = new Client({ 
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.login(token);

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!find')) return;

  const query = message.content.slice(6).trim();
  if (!query) {
    message.reply('Please provide a file name to search for.');
    return;
  }

  // Example response
  message.reply(`Searching for files with name '${query}'...`);

  // Example file search logic
  // Replace this with your own file search implementation
  const files = [];

  fetchAllMessages(message.channel).then(messages => {

    messages.forEach(msg => {
      if(msg.attachments.size > 0) {
        for(let index = 0; index < msg.attachments.size; index++) {
          files.push(`[` + msg.attachments.at(index).name.toLowerCase() + `](` + msg.url + `)`);
        }
      }
    });

    const matchedFiles = files.filter((file) =>
    file.toLowerCase().includes(query.toLowerCase()));

    if (matchedFiles.length > 0) {
      message.reply({ embeds: [new EmbedBuilder().setTitle(`Found ${matchedFiles.length} files:`).setDescription(`${matchedFiles.join(', ')}`)] });
    } else {
      message.reply({ embeds: [new EmbedBuilder().setTitle('No files found with that name.').setDescription(":shrug:")]});
    }
  })

});


async function fetchAllMessages(channel) {
  let messages = [];

  // Create message pointer
  let message = await channel.messages
    .fetch({ limit: 1 })
    .then(messagePage => (messagePage.size === 1 ? messagePage.at(0) : null));

  while (message) {
    await channel.messages
      .fetch({ limit: 100, before: message.id })
      .then(messagePage => {
        messagePage.forEach(msg => messages.push(msg));

        // Update our message pointer to be last message in page of messages
        message = 0 < messagePage.size ? messagePage.at(messagePage.size - 1) : null;
      })
  }

  return messages;
}