import discord
import requests
import os
from dotenv import load_dotenv

load_dotenv()

TOKEN = os.getenv('DISCORD_BOT_TOKEN')
WEBHOOK_API = os.getenv('BORZOI_WEBHOOK_URL', 'http://localhost:3000/api/discord-webhook')

intents = discord.Intents.default()
intents.message_content = True
client = discord.Client(intents=intents)

@client.event
async def on_ready():
    print(f'✅ Borzoi Discord Bridge active as: {client.user}')

@client.event
async def on_message(message):
    if message.author == client.user:
        return

    payload = {
        "author": message.author.display_name,
        "channel": str(message.channel),
        "content": message.content,
        "guildName": message.guild.name if message.guild else "Class Group"
    }

    try:
        res = requests.post(WEBHOOK_API, json=payload, timeout=3)
        if res.status_code == 200:
            print(f"Forwarded from #{message.channel}: {message.content[:30]}...")
    except Exception as e:
        print(f"Webhook forward error: {e}")

if __name__ == "__main__":
    if TOKEN:
        client.run(TOKEN)
    else:
        print("Missing DISCORD_BOT_TOKEN in environment.")