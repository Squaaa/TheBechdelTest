let top10Data = [];
let alltimeData = [];

queue()
    .defer(d3.csv,"data/top10_data/nextBechdel_allTests.csv")
    .defer(d3.csv,"data/top10_data/nextBechdel_castGender.csv")
    .defer(d3.csv,"data/top10_data/nextBechdel_crewGender.csv")
    .defer(d3.csv,"data/top10_data/dialogue/CivilWar.csv")
    .defer(d3.csv,"data/top10_data/dialogue/FindingDory.csv")
    .defer(d3.csv,"data/top10_data/dialogue/Zootopia.csv")
    .defer(d3.csv,"data/top10_data/dialogue/Junglebook.csv")
    .defer(d3.csv,"data/top10_data/dialogue/SecretLifeofPets.csv")
    .defer(d3.csv,"data/top10_data/dialogue/BatmanVSuperman.csv")
    .defer(d3.csv,"data/top10_data/dialogue/Deadpool.csv")
    .defer(d3.csv,"data/top10_data/dialogue/FantasticBeasts.csv")
    .defer(d3.csv,"data/top10_data/dialogue/SuicideSquad.csv")
    .defer(d3.csv,"data/top10_data/dialogue/RogueOne.csv")
    .defer(d3.csv,"data/alltime_data/movies.csv")
    .defer(d3.csv,"data/alltime_data/Bechdel-master_revenue.csv")
    .await(wrangleData);

function wrangleData(error, top10bechdelTests, top10castGender, top10crewGender,
                     civilWarData, findingDoryData, zootopiaData, junglebookData,
                     secretLifeofPetsData, batmanVSupermanData, deadpoolData,
                     fantasticBeastsData, suicideSquadData, rogueOneData,
                     allTimeMovies, allTimeGenre) {
    if  (error) {
        console.log(error);
    }

    // titles/dialogue data of top 10 grossing movies from 2016, manually sorted descending revenue
    var top10titles = ["Captain America: Civil War", "Finding Dory", "Zootopia", "The Jungle Book",
                        "The Secret Life of Pets", "Batman v Superman: Dawn of Justice", "Deadpool",
                        "Fantastic Beasts and Where to Find Them", "Suicide Squad", "Rogue One"];
    var top10dialogue = [civilWarData, findingDoryData, zootopiaData, junglebookData, secretLifeofPetsData,
                        batmanVSupermanData, deadpoolData, fantasticBeastsData, suicideSquadData, rogueOneData];

    for (let i = 0; i < top10titles.length; i++) {
        let movie = {
            'title': top10titles[i],
            'bechdel': null
        };

        let testIndex = 0;
        while (movie['bechdel'] === null) {
            let currMovie = top10bechdelTests[testIndex];
            if (currMovie['movie'] === movie['title']) {
                movie['bechdel'] = +currMovie['bechdel'] === 1;
            }
            testIndex++;
        }

        let castData = [];
        for (let i = 0; i < top10castGender.length; i++) {
            let currActor = top10castGender[i];
            if (currActor['MOVIE'] === movie['title']) {
                let actorData = {
                    'name': currActor['ACTOR'],
                    'gender': currActor['GENDER'].toLowerCase(),
                    'character': currActor['CHARACTER_NAME'],
                    'characterType': currActor['TYPE'],
                    'billing': +currActor['BILLING']
                };
                castData.push(actorData);
            }
            // exception for Rogue One (title discrepancy)
            if (movie['title'] === "Rogue One" && currActor['MOVIE'] === "Rogue One: A Star Wars Story") {
                let actorData = {
                    'name': currActor['ACTOR'],
                    'gender': currActor['GENDER'],
                    'character': currActor['CHARACTER_NAME'],
                    'characterType': currActor['TYPE'],
                    'billing': +currActor['BILLING']
                };
                castData.push(actorData);
            }
        }
        movie['castData'] = castData;

        // NOTE: missing crewData available for 'Fantastic Beasts and Where to Find Them' and 'Suicide Squad'
        let crewData = [];
        for (let i = 0; i < top10crewGender.length; i++) {
            let currCrew = top10crewGender[i];
            if (currCrew['MOVIE'] === movie['title'] + "_(2016)") {
                if (currCrew['GENDER_GUESS'] && currCrew['GENDER_GUESS'] !== "null") {
                    let crewMember = {
                        'name': currCrew['FULL_NAME'],
                        'gender': currCrew['GENDER_GUESS'],
                        'department': currCrew['DEPARTMENT'].replace("_", "").replace("by", "")
                    };
                    crewData.push(crewMember);
                }
            }
        }
        movie['crewData'] = crewData;

        let dialogueData = [];
        for (let dialogueIndex in top10dialogue[i]) {
            let character = top10dialogue[i][dialogueIndex];
            let characterData = {
                'character': character['Character'],
                'gender': character['Gender'],
                'words': +character['Total_Words'],
                'speakingTurns': +character['speaking_turns']
            };
            dialogueData.push(characterData);
        }
        movie['dialogueData'] = dialogueData;
        top10Data.push(movie);
    }

    console.log(top10Data);

    for (let i = 0; i < allTimeMovies.length; i++) {
        let currMovie = allTimeMovies[i];
        let movie = {
            'title': currMovie['title'],
            'bechdel': currMovie['binary'] === "PASS",
            'year': +currMovie['year'],
            'budget': +currMovie['budget'],
            'budget2013': +currMovie['budget_2013$'],
            'domesticGross': +currMovie['domgross'],
            'domesticGross2013': +currMovie['domgross_2013$'],
            'internationalGross': +currMovie['intgross'],
            'internationalGross2013': +currMovie['intgross_2013$'],
            'genre': null
        };

        for (let j = 0; j < allTimeGenre.length; j++) {
            let currGenreMovie = allTimeGenre[j];
            if (currGenreMovie && currGenreMovie['Movie'] === movie['title']) {
                movie['genre'] = currGenreMovie['Genre'];
            }
        }

        if (movie['genre']) {
            alltimeData.push(movie);
        }
    }

    console.log(alltimeData);

    createVis();
}

function createVis() {
    var myEventHandler = {};

    var areachart = new StackedAreaChart("time-area-chart", alltimeData, myEventHandler);
    // TODO link to scatterplot
    var casticonchart = new IconChart("cast-icon-chart", top10Data[0]['castData']);
    var crewiconchart = new IconChart("crew-icon-chart", top10Data[0]['crewData']);
    var genrechart = new StackedBarChart("time-genre-bar-chart", alltimeData);
    var barchart2016 = new BarChart2016("top-10-bar-chart", top10Data);
    var scatterplot = new ScatterPlot("time-money-scatterplot", alltimeData);

    $(myEventHandler).bind("selectionChanged", function(event, rangeStart, rangeEnd){
        genrechart.onSelectionChange(rangeStart, rangeEnd);
    });
}
