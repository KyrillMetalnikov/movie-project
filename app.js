const express = require('express');
const mysql = require('mysql');
const {selectAllMovies, buildUpdateQueryParams, connection } = require('./utils/utils')
var cors = require('cors');
var app = express();

app.use(express.json());
app.use(cors());

const host = 'localhost:'
const port = 4000;

// Gets the movies based on title
app.get('/API/V1/movies', function(req, res) {
    const title = req.query.title;
    connection.query(`SELECT * FROM movie WHERE movie_title LIKE '%${title}%'`, function(error, results, fields) {
        if (error) {
            res.status(500);
            res.send("Unknown Server Error");
            return;
        }

        res.status(200);
        res.send(results);
    });
});

// Adds a new movie to the DB
app.post('/API/V1/movies', function(req, res) {
    const {title, description, releaseYear, duration, rating=0} = req.body;
    
    if (title) {
        connection.query(`INSERT INTO movie VALUES (?, ?, ?, ?, ?)`, [title, description, releaseYear, duration, rating], function(error, results, fields) {
            if (error) {
                res.status(403);
                res.send("Movie already exists with that title");
                return;
            }

            res.status(201);
            res.send("Movie successfully added");
        });
    } else {
        res.status(400);
        res.send("Title is mandatory");
    }
});

// Deletes a movie from the DB
app.delete('/API/V1/movies', function(req, res) {
    const title = req.body.title;
    if (title) {
        connection.query(`DELETE FROM movie WHERE movie_title='${title}'`, function(error, results, fields) {
            if (error) {
                res.status(500);
                res.send("Unknown error has occured");
                return;
            }

            if (results.affectedRows != 0) {
                res.status(200);
                res.send("Movie successfully deleted");
                return;
            } else {
                res.status(200);
                res.send("No movie with that title was found");
            }
        });
    } else {
        res.status(400);
        res.send("Title is mandatory");
    }
});

// Gets the movies based on title
app.patch('/API/V1/movies', function(req, res) {
    let {title, description, releaseYear, duration, rating=0} = req.body;

    if (!title) {
        res.status(403);
        res.send("Title is mandatory");
    } else {
        selectAllMovies(title).then(function(results){
            let array0 = [description, releaseYear, duration, rating, title];
            let array1 = [results[0].MOVIE_DESCRIPTION, results[0].MOVIE_RELEASE_YEAR, results[0].MOVIE_DURATION, results[0].MOVIE_RATING, results[0].MOVIE_TITLE];
            let queryParams = buildUpdateQueryParams(array0, array1);

            connection.query(`UPDATE movie SET movie_description=?, movie_release_year=?,
                movie_duration=?, movie_rating=? WHERE movie_title=?`, queryParams, function(error, results, fields) {
                if (error) {
                    res.status(500);
                    res.send("Unknown Server Error");
                    console.log(error);
                    return;
                }

                res.status(201);
                res.send(title + " successfully updated!");
            }) 
        });
    }
});

app.listen(port, () => {
	console.log(`Server running at port: ${host + port}`);
})
