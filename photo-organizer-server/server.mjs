import path from 'path';
import express from 'express';
import config from 'config';
import axios from 'axios';

const scryfallConfiguration = config.get('scryfall');

const PORT = process.env.PORT || 3001;
const app = express();
const scryfallHttp = axios.create({
    baseURL: scryfallConfiguration.baseUrl
});

app.get('/v1/sets', (req, res) => {
    const results = [];
    scryfallHttp.get(scryfallConfiguration.api.sets.all)
    .then(sets => {
        for (const set of sets.data.data) {
            results.push({
                id: set.id,
                code: set.code,
                name: set.name,
                card_count: set.card_count,
                icon: set.icon_svg_uri
            });
        }

        res.json({
            data: results
        });
    });
});

const getCards = (res, url) => {
    scryfallHttp.get(url)
    .then(cards => {
        const results = [];
        for (const card of cards.data.data) {
            results.push({
                id: card.id,
                name: card.name,
                imageUris: card.image_uris
            });
        }

        res.json({
            hasMore: cards.data.has_more,
            nextPage: cards.data.has_more ? cards.data.next_page.split('?')[1] : '',
            data: results
        });
    });
}

app.get('/v1/sets/:id', (req, res) => {
    getCards(res, `${scryfallConfiguration.api.sets.bySet}q=set:${req.params.id}`);
});

app.get('/v1/nextPage/:pageRef', (req, res) => {
    getCards(res, `${scryfallConfiguration.api.sets.bySet}${req.params.pageRef}`);
});

app.get("/api", (req, res) => {
    res.json({
        message: "Hello from the other side"
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../photo-organizer-client/build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
});