module.exports = {
    name: 'kick',
    description: 'Kicks a user from the guild'   ,
    execute(messages, args) {
        const member = messages.mention.users.first();
        if(member){
            const memberTarget = messages.guild.members.cache.get(member.id)
            memberTarget.kick();
            message.channel.send("User Has been kicked");
        }
        else
            message.channel.send('Please provide a member to kick')
    }
}