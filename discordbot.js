const Discord = require("discord.js");
const noblox = require("noblox.js");
require("dotenv").config(); // dotenv 패키지 불러오기

const client = new Discord.Client();

const DISCORD_ID = process.env.DISCORD_ID; // 환경변수 사용
const ROBLOX_GROUP_ID = process.env.ROBLOX_GROUP_ID; // 환경변수 사용

client.login(process.env.DISCORD_BOT_TOKEN); // 환경변수 사용

client.on("ready", async() => {
    console.log(`Logged in as ${client.user.tag}!`);

    const robloxUsername = process.env.ROBLOX_USERNAME; // 환경변수 사용
    const robloxPassword = process.env.ROBLOX_PASSWORD; // 환경변수 사용
    await noblox.setCookie(robloxUsername, robloxPassword);

    const groupInfo = await noblox.getGroup(ROBLOX_GROUP_ID, true);
    const groupRankIds = await noblox.getRankIds(ROBLOX_GROUP_ID);

    const interval = 60 * 60 * 1000; // 1 hour interval (in milliseconds)
    setInterval(async() => {
        const members = await noblox.getPlayers(ROBLOX_GROUP_ID);

        for (const member of members) {
            const discordId = await getDiscordId(member.userId);
            if (discordId) {
                const memberRank = member.rank;
                const nextRankId = getNextRankId(groupRankIds, memberRank);

                await noblox.setRank(ROBLOX_GROUP_ID, member.userId, nextRankId);
                console.log(`Updated ${member.username}'s rank to ${groupInfo.roles[nextRankId].name}`);
                const dmChannel = await client.users.cache.get(discordId).createDM();
                dmChannel.send(`Your rank in ${groupInfo.name} has been updated to ${groupInfo.roles[nextRankId].name}!`);
            }
        }
    }, interval);
});

async function getDiscordId(userId) {
    // Get the Discord ID of a user by their Roblox ID
    // You can modify this function to suit your own needs
    return DISCORD_ID;
}

function getNextRankId(rankIds, currentRank) {
    // Get the next rank ID in the rank hierarchy
    const currentRankIndex = rankIds.indexOf(currentRank);
    if (currentRankIndex === rankIds.length - 1) {
        return currentRank; // Cannot promote beyond the highest rank
    } else {
        return rankIds[currentRankIndex + 1];
    }
}