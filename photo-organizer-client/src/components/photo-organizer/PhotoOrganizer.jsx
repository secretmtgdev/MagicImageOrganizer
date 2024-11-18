import { useEffect, useState } from "react";

import './PhotoOrganizer.css';

const PhotoOrganizer = () => {
    const [sets, setSets] = useState([]);
    const [currentSet, setCurrentSet] = useState(null);

    const [cards, setCards] = useState([]);
    const [nextPage, setnextPage] = useState('');
    const [userInfo, setUserInfo] = useState(null);

    const loadCards = (setCode) => {
        if (setCode === currentSet) {
            return;
        }

        setnextPage('');
        setCurrentSet(setCode);
        fetch(`/v1/sets/${setCode}`)
            .then(res => res.json())
            .then(res => {
                if (res.hasMore) {
                    setnextPage(res.nextPage);
                }
                
                setCards(res.data);
            });
    }

    const loadMoreCards = () => {
        fetch(`/v1/nextPage/${nextPage}`)
            .then(res => res.json())
            .then(res => {
                if (res.hasMore) {
                    setnextPage(res.nextPage);
                } else {
                    setnextPage('');
                }
                setCards([...cards, ...res.data]);
            })
    }

    useEffect(() => {
        // data render twice only happens in dev env: https://tinyurl.com/2ys4w38m
        fetch('/v1/sets')
            .then((res) => res.json())
            .then((res) => {
                setSets(res.data);
            });
    }, []);
    return (
        <div className="photo-organizer">
            <p>Showing photos for {!userInfo ? "Loading" : userInfo}</p>
            <div className="category-selector">
                <select onChange={(e) => loadCards(e.target.value)}>
                    <option key='' value=''>Select a set...</option>
                    {
                        sets.map(set => (
                            <option key={set.id} value={set.code}>{set.name}</option>
                        ))
                    }
                </select>
            </div>
            <div className="photo-gallery">
                {
                    cards.map(card => (
                        <img loading="lazy" className="card-image" key={card.id} alt={card.name} src={card.imageUris?.png} />
                    ))
                }
                {!!nextPage && 
                    (<div>
                        <button onClick={loadMoreCards}>View more...</button>
                    </div>)
                }
            </div>
        </div>
    )
}

export default PhotoOrganizer;