import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcrypt';

const dbPromise = open({
    filename: './database.sqlite',
    driver: sqlite3.Database
});

const populateDatabase = async () => {
    const db = await dbPromise;

    const memes = [
        'http://localhost:3000/memes/meme1.jpg',
        'http://localhost:3000/memes/meme2.jpg',
        'http://localhost:3000/memes/meme3.jpg',
        'http://localhost:3000/memes/meme4.jpg',
        'http://localhost:3000/memes/meme5.jpg',
        'http://localhost:3000/memes/meme6.jpg',
        'http://localhost:3000/memes/meme7.jpg',
        'http://localhost:3000/memes/meme8.jpg',
        'http://localhost:3000/memes/meme9.jpg',
        'http://localhost:3000/memes/meme10.jpg',
        'http://localhost:3000/memes/meme11.jpg',
        'http://localhost:3000/memes/meme12.jpg'
    ];

    const captions = [
        ["When you realize the weekend is over", "Me on Monday morning", "When you find money in your pocket", "Feeling like a boss", "Winning at life", "When you get a promotion", "Living the dream"],
        ["Is this a butterfly?", "When you see something confusing", "When you find a new hobby", "Seeing something for the first time", "A moment of clarity", "Questioning everything", "Nature is amazing"],
        ["Epic handshake", "Unity and strength", "Making new friends", "Business partners", "Teamwork makes the dream work", "Agreeing on something", "Meeting your idol"],
        ["When you realize it's Monday", "Me every Monday morning", "When you remember something important", "An unexpected slap", "Trying to stay awake", "The reality of life", "Feeling betrayed"],
        ["Buzz: Look at all the possibilities", "Woody: Overwhelmed", "When you have too many options", "Exploring new opportunities", "Thinking about the future", "When someone explains a new concept", "Daydreaming"],
        ["Disaster Girl", "When you know you caused the trouble", "Feeling mischievous", "Watching the world burn", "Chaos in the background", "A troublemaker's smile", "Innocence lost"],
        ["The Office handshake", "Meeting someone important", "Starting a new job", "First day at work", "When you meet your idol", "Making a good impression", "Business deal"],
        ["Soviet Bugs Bunny", "When communism is the answer", "Feeling patriotic", "A blast from the past", "Old cartoon memories", "Political commentary", "Historical humor"],
        ["Tom's angry face", "When you're really mad", "Feeling frustrated", "Trying to stay calm", "Anger management", "When someone tests your patience", "Losing your cool"],
        ["You guys are getting paid?", "When you realize everyone else gets paid", "Surprised face", "When you hear good news", "Feeling left out", "Realizing something important", "When you get a raise"],
        ["Suspicious hamster", "When you hear something strange", "Cute but confused", "What did you say?", "Feeling unsure", "Hesitant hamster", "Doubtful look"],
        ["Hiding behind a tree", "When you plan something mischievous", "Waiting for the right moment", "Planning my next move", "Sneaky look", "Lurking around", "Ready to pounce"]
    ];

    await db.exec('DELETE FROM memes');
    await db.exec('DELETE FROM captions');
    await db.exec('DELETE FROM meme_captions');

    for (const [index, meme] of memes.entries()) {
        await db.run('INSERT INTO memes (url) VALUES (?)', meme);
        const memeId = await db.get('SELECT last_insert_rowid() as id');
        const memeCaptions = captions[index];

        for (const [captionIndex, caption] of memeCaptions.entries()) {
            await db.run('INSERT INTO captions (text) VALUES (?)', caption);
            const captionId = await db.get('SELECT last_insert_rowid() as id');

            if (captionIndex < 2) {
                await db.run('INSERT INTO meme_captions (meme_id, caption_id) VALUES (?, ?)', [memeId.id, captionId.id]);
            }
        }
    }

    console.log('Database populated with memes and captions');
};

populateDatabase().catch(err => console.error(err));
