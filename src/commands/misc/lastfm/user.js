const { SwitchbladeEmbed, Constants, MiscUtils, CommandParameters, CommandStructures, Command } = require('../../../')
const { StringParameter, CommandError } = CommandStructures
const moment = require('moment')

module.exports = class LastfmUser extends Command {
  constructor (client, parentCommand) {
    super(client, parentCommand || 'lastfm')
    this.name = 'user'
    this.aliases = ['u']

    this.parameters = new CommandParameters(this,
      new StringParameter({
        full: true,
        missingError: 'commands:lastfm.subcommands.user.missing'
      })
    )
  }

  async run ({ t, author, channel, guild, language }, param) {
    channel.startTyping()
    const embed = new SwitchbladeEmbed(author)

    try {
      const { user } = await this.client.apis.lastfm.getUserInfo(param)
      const time = moment(user.registered.unixtime * 1000).format('LLL')

      let { topartists } = await this.client.apis.lastfm.getUserTop(param, 'artists', '1month', 5)
      topartists = topartists.artist

      embed.setAuthor(user.realname || user.name, 'https://i.imgur.com/TppYCun.png', user.url)
        .setThumbnail(user.image[3]['#text'])
        .addField(t('commands:lastfm.playcount'), MiscUtils.formatNumber(user.playcount, language), true)
        .addField(t('commands:lastfm.registered'), time, true)
        .setColor(Constants.LASTFM_COLOR)

      embed.setTitle(user.realname || user.name)
      if (topartists.length) {
        const topField = topartists.map(artist => `\`${artist['@attr'].rank}.\` [${artist.name}](${artist.url}) - ${t('commands:lastfm.playcountCount', { times: artist.playcount })}`)
        embed.addField(t('commands:lastfm.topArtists'), topField)
      }

      channel.send(embed).then(() => channel.stopTyping())
    } catch (e) {
      throw new CommandError(t('commands:lastfm.subcommands.user.notFound'))
    }
  }
}
