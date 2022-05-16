const res = require('express/lib/response');
const mysql = require('mysql')

const connection = mysql.createConnection({
    host     : 'localhost',
    database : 'movies',
    user     : 'root',
    password : '',
    port: 3306
});

// selects all movies as a promise in order to allow for chained queries
const selectAllMovies = (title) => new Promise(resolve => {
    connection.query(`SELECT * from movie WHERE movie_title='${title}'`, function(error, results, fields) {
        if (error) {
            res.status(500);
            res.send("Unknown Server Error");
            return;
        }
        resolve(results);
    });
});

// Fills null request params with the existing params for an easier update query
function buildUpdateQueryParams(requestParams, existingParams) {
    result = [];
    for (let i = 0; i < existingParams.length; i++) {
        if (requestParams[i]) {
            result[i] = requestParams[i];
        } else {
            if (!existingParams[i]) {
                existingParams[i] = undefined;
            }
            result[i] = existingParams[i];
        }
    }
    return result;
}


module.exports = { selectAllMovies, buildUpdateQueryParams, connection }