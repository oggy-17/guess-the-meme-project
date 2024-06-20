import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the captions for each meme with only the first one correct
const captionsData = [
    { file: 'meme1.jpg', captions: ['When you see someone hotter than your date.', 'When you forget your keys inside the house.', 'When you win the lottery.', 'When your food is too spicy.', 'When you lose your phone.', 'When your friend tells a bad joke.', 'When you realize you are late for work.'] },
    { file: 'meme2.jpg', captions: ['Drake approves of something.', 'Drake disapproves of something.', 'Drake is confused.', 'Drake is angry.', 'Drake is sad.', 'Drake is surprised.', 'Drake is laughing.'] },
    { file: 'meme3.jpg', captions: ['Choosing between two difficult options.', 'Celebrating a birthday.', 'Finding a parking spot.', 'Ordering food online.', 'Watching a movie.', 'Playing a video game.', 'Reading a book.'] },
    { file: 'meme4.jpg', captions: ['Excited but suddenly worried.', 'Winning a marathon.', 'Eating ice cream.', 'Going for a swim.', 'Sleeping peacefully.', 'Climbing a mountain.', 'Driving a car.'] },
    { file: 'meme5.jpg', captions: ['Making a last-minute decision.', 'Cooking dinner.', 'Walking the dog.', 'Studying for exams.', 'Playing soccer.', 'Painting a picture.', 'Going to the gym.'] },
    { file: 'meme6.jpg', captions: ['Girl smiling at disaster.', 'Girl playing with toys.', 'Girl reading a book.', 'Girl swimming in a pool.', 'Girl baking cookies.', 'Girl watching TV.', 'Girl riding a bike.'] },
    { file: 'meme7.jpg', captions: ['Waiting for something to happen.', 'Going to a party.', 'Cleaning the house.', 'Shopping for groceries.', 'Playing a board game.', 'Learning to dance.', 'Writing a letter.'] },
    { file: 'meme8.jpg', captions: ['Strong vs. weak Doge comparison.', 'Cats vs. dogs.', 'Summer vs. winter.', 'Happy vs. sad.', 'Day vs. night.', 'Work vs. vacation.', 'Coffee vs. tea.'] },
    { file: 'meme9.jpg', captions: ['Woman yelling at a cat.', 'Cat chasing a mouse.', 'Dog barking at a squirrel.', 'Bird flying in the sky.', 'Fish swimming in a tank.', 'Horse running in a field.', 'Snake slithering on the ground.'] },
    { file: 'meme10.jpg', captions: ['This is fine.', 'This is amazing.', 'This is terrible.', 'This is hilarious.', 'This is boring.', 'This is confusing.', 'This is exciting.'] },
    { file: 'meme11.jpg', captions: ['When you realize the weekend is almost over.', 'When you win the lottery.', 'When you remember you left the stove on.', 'When you find out your friend lied.', 'When you see your ex with someone new.', 'When you realize you forgot your homework.', 'When you get a new puppy.'] },
    { file: 'meme12.jpg', captions: ['Batman slaps Robin for saying "It\'s Monday again."', 'Robin tells Batman a joke.', 'Batman asks for directions.', 'Robin suggests going for ice cream.', 'Batman compliments Robin\'s costume.', 'Robin says he\'s tired.', 'Batman talks about a new mission.'] },
    { file: 'meme13.jpg', captions: ['When you pretend to understand a math problem.', 'When you ace a test.', 'When you tell a joke.', 'When you see your crush.', 'When you win a game.', 'When you hear your favorite song.', 'When you find money on the ground.'] },
    { file: 'meme14.jpg', captions: ['When you and your friend finally agree on what to eat.', 'When you meet a stranger.', 'When you finish a puzzle.', 'When you lose a game.', 'When you find a lost item.', 'When you cook dinner.', 'When you watch a movie.'] },
    { file: 'meme15.jpg', captions: ['Success Kid: When you pass a difficult exam.', 'When you miss your bus.', 'When you forget your keys.', 'When you spill your coffee.', 'When you break your phone.', 'When you lose your wallet.', 'When you fail a test.'] },
];

(async () => {
    const db = await open({
        filename: './database.db',
        driver: sqlite3.Database
    });

    const memeDir = path.join(__dirname, '../client/public/memes');
    const memeFiles = fs.readdirSync(memeDir);

    // Remove all existing entries
    await db.run('DELETE FROM memes');
    await db.run('DELETE FROM captions');
    await db.run('DELETE FROM meme_captions');

    // Insert new entries
    for (const meme of captionsData) {
        const imageUrl = `/memes/${meme.file}`;
        const { lastID: memeId } = await db.run('INSERT INTO memes (image_url) VALUES (?)', [imageUrl]);
        console.log(`Inserted meme: ${imageUrl} with ID: ${memeId}`);

        for (let i = 0; i < meme.captions.length; i++) {
            const captionText = meme.captions[i];
            const bestMatch = i === 0; // Only the first caption is correct
            const { lastID: captionId } = await db.run('INSERT INTO captions (text) VALUES (?)', [captionText]);
            await db.run('INSERT INTO meme_captions (meme_id, caption_id, best_match) VALUES (?, ?, ?)', [memeId, captionId, bestMatch]);
        }
    }

    console.log('Meme and caption insertion complete');
})();
