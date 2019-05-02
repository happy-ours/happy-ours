DROP TABLE IF EXISTS pets;

CREATE TABLE pets(
    id SERIAL PRIMARY KEY,
    restaurant VARCHAR(255),
    petfriendly INT
);