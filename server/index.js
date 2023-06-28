const express = require('express');
const db = require('./config/db')
const cors = require('cors')
const path = require('path');

const app = express();
const PORT = 3333;
app.use(cors());
app.use(express.json())

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', '../../public/index.html'));
});


app.get('/filter', (req, res) => {

    const year1 = req.query.first_year || 2000
    const year2 = req.query.second_year || 2024
    const table = req.query.table ?? 'all'
    const name = req.query.name ?? ''
    const title = req.query.title ?? ''
    const campus = req.query.campus ?? ''

    const where_array = [
        {
            value1: 'year',
            operator: '>=',
            value2: year1
        },
        {
            value1: 'year',
            operator: '<=',
            value2: year2
        },
        {
            value1: 'name',
            operator: 'LIKE',
            value2: `'%${name}%'`
        },
        {
            value1: 'title',
            operator: 'LIKE',
            value2: `'%${title}%'`
        },
        {
            value1: 'campus',
            operator: 'LIKE',
            value2: `'%${campus}%'`
        },
    ]
    let where_array_text = ""
    where_array.map((data) => {
        if (!(data.value1 === 'year' && table === 'apresentation'))
            where_array_text += data.value1 + " " + data.operator + " " + data.value2 + " AND "
    })
    where_array_text = where_array_text.substring(0, where_array_text.length - 4)

    const event_or_book = {
        article: 'title_book as event_or_book, ',
        event: 'name_event as event_or_book, ',
        apresentation: 'name_event as event_or_book, ',
        scientificjournal: 'title_journal as event_or_book, '
    }

    const link = {
        article: 'home_page_article as link, ',
        event: 'home_page_event as link, ',
        scientificjournal: 'home_page_journal as link, '
    }

    const type = {
        article: 'status as type ',
        event: 'type as type ',
        apresentation: 'category as type ',
        patent: 'type as type ',
        producttechnology: 'category as type ',
        scientificjournal: 'status as type '
    }

    const query1 =
        "SELECT "
        + (table !== 'apresentation' ? 'year, ' : ' ')
        + (event_or_book[table] ?? ' ')
        + (link[table] ?? ' ')
        + (type[table] ? type[table] + ", " : ' ')
        + " title, PN.name AS name, PN.campus AS campus FROM biographical_production_"
        + table + " LEFT JOIN person_naturalperson AS PN ON natural_person_id = PN.id"
        + " WHERE " + (where_array_text.trim() || "1")

    let query2 = "SELECT ";
    query2 += "Tabela.NomeTabela, ";
    query2 += "Tabela.year, ";
    query2 += "Tabela.title, ";
    query2 += "Tabela.event_or_book, ";
    query2 += "Tabela.link, ";
    query2 += "Tabela.type, ";
    query2 += "PN.name AS name, ";
    query2 += "PN.campus AS campus ";
    query2 += "FROM ( ";
    query2 += "SELECT 'biographical_production_article' AS NomeTabela, year, title, natural_person_id, title_book as event_or_book, home_page_article as link, " + type['article'] + " FROM biographical_production_article ";
    query2 += "UNION ";
    query2 += "SELECT 'biographical_production_event' AS NomeTabela, year, title, natural_person_id, name_event AS event_or_book, home_page_event as link, " + type['event'] + " FROM biographical_production_event ";
    query2 += "UNION ";
    query2 += "SELECT 'biographical_production_apresentation' AS NomeTabela, NULL AS year, title, natural_person_id, name_event AS event_or_book, NULL AS link, " + type['apresentation'] + " FROM biographical_production_apresentation ";
    query2 += "UNION ";
    query2 += "SELECT 'biographical_production_patent' AS NomeTabela, year, title, natural_person_id, NULL AS event_or_book, NULL AS link, " + type['patent'] + " FROM biographical_production_patent ";
    query2 += "UNION ";
    query2 += "SELECT 'biographical_production_producttechnology' AS NomeTabela, year, title, natural_person_id, NULL AS event_or_book, NULL AS link, " + type['producttechnology'] + " FROM biographical_production_producttechnology ";
    query2 += "UNION ";
    query2 += "SELECT 'biographical_production_scientificjournal' AS NomeTabela, year, title, natural_person_id, title_journal AS event_or_book, home_page_journal as link, " + type['scientificjournal'] + " FROM biographical_production_scientificjournal ";
    query2 += ") AS Tabela ";
    query2 += "LEFT JOIN person_naturalperson AS PN ON Tabela.natural_person_id = PN.id";
    query2 += " WHERE " + (where_array_text.trim() || "1")

    console.log(where_array_text)

    db.query(table === "all" ? query2 : query1, (err, result) =>
        err ? console.log(err) : res.json({ result })
    )
})

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
})