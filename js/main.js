let top10Data = [];
let alltimeData = [];

queue()
    .defer(d3.csv,"data/top10_data/nextBechdel_allTests.csv")
    .defer(d3.csv,"data/top10_data/nextBechdel_castGender.csv")
    .defer(d3.csv,"data/top10_data/nextBechdel_crewGender.csv")
    .defer(d3.csv,"data/top10_data/dialogue/CivilWar.csv")
    .defer(d3.csv,"data/top10_data/dialogue/RogueOne.csv")
    .defer(d3.csv,"data/top10_data/dialogue/FindingDory.csv")
    .defer(d3.csv,"data/top10_data/dialogue/Zootopia.csv")
    .defer(d3.csv,"data/top10_data/dialogue/Junglebook.csv")
    .defer(d3.csv,"data/top10_data/dialogue/SecretLifeofPets.csv")
    .defer(d3.csv,"data/top10_data/dialogue/BatmanVSuperman.csv")
    .defer(d3.csv,"data/top10_data/dialogue/FantasticBeasts.csv")
    .defer(d3.csv,"data/top10_data/dialogue/Deadpool.csv")
    .defer(d3.csv,"data/top10_data/dialogue/SuicideSquad.csv")
    .defer(d3.csv,"data/alltime_data/movies.csv")
    .defer(d3.csv,"data/alltime_data/Bechdel-master_revenue.csv")
    .await(wrangleData);

function wrangleData(error, top10bechdelTests, top10castGender, top10crewGender,
                     civilWarData, rogueOneData, findingDoryData, zootopiaData, junglebookData,
                     secretLifeofPetsData, batmanVSupermanData, fantasticBeastsData, deadpoolData,
                     suicideSquadData, allTimeMovies, allTimeGenre) {
    if  (error) {
        console.log(error);
    }

    // titles/dialogue data of top 10 grossing movies from 2016, manually sorted descending revenue
    let top10titles = ["Captain America: Civil War", "Rogue One", "Finding Dory", "Zootopia", "The Jungle Book",
                        "The Secret Life of Pets", "Batman v Superman: Dawn of Justice",
                        "Fantastic Beasts and Where to Find Them", "Deadpool",  "Suicide Squad"];
    let top10dialogue = [civilWarData, rogueOneData, findingDoryData, zootopiaData, junglebookData, secretLifeofPetsData,
                        batmanVSupermanData, fantasticBeastsData, deadpoolData, suicideSquadData];
    let top10BoxOffice = [1153, 1056, 1029, 1024, 966, 875, 872, 812, 783, 746];
    let top10Analysis = ["Passes all three tests, barely. The team is collectively discussing mission details, during which Natasha (Black Widow) and Wanda (Scarlet Witch) briefly address one another.",
    "Passes all three tests, barely. Jyn and Lyra (her mother) exchange a few words about hiding. Jyn and Mon Mothma exchange a few words, but mostly talk to the group.",
        "Passes all three tests, thoroughly. Dory and Destiny have several conversations with each other. Dory, her mom, and several supporting characters do as well.",
        "Passes all three tests, with flying colors. Judy Hopps, Gazelle, Mrs. Otterton, Judy's Mom, Dharma Armadillo, Fru Fru, and Bellweather have several conversations.",
        "Passes only two tests. Kaa (the snake) and Raksha (the wolf) do talk to each other, but it's about Mowgli's father.",
        "Passes only two tests. Gidget and Chloe both talk to each other, but only about their male love interests.",
        "Passes only two tests. Lois and Martha talk about the former's relationship with Kent. Jenny also says a total of five words to Lois, but she doesn't respond. In the extended edition, however, there is a deleted scene where they talk.",
        "Passes all three tests, barely. Mary Lou, Modesty, Seraphina, Tina, the MACUSA president, and Newt have brief or dubiously non-male centered conversations.",
        "Passes only one test. The film has a few named female characters such as Vanessa, NTW, and Angel Dust, but they never talk with each other.",
        "Passes all three tests, barely. Amanda Waller, Harleen Quinzel, and June Moone have very brief conversations."];

    let top10clips = ["<iframe width=\"480\" height=\"360\" src=\"https://ytcropper.com/embed/At5bfdda67988ed/loop/noautoplay/\" frameborder=\"0\" allowfullscreen></iframe><a href=\"/\" target=\"_blank\">via ytCropper</a>",
    "<iframe width=\"480\" height=\"360\" src=\"https://www.youtube.com/embed/FQSgnwGsnzg\" frameborder=\"0\" allow=\"accelerometer; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen></iframe>",
    "<iframe width=\"480\" height=\"360\" src=\"https://ytcropper.com/embed/If5bfdeb8534d84/loop/noautoplay/\" frameborder=\"0\" allowfullscreen></iframe><a href=\"/\" target=\"_blank\">via ytCropper</a>",
    "<iframe width=\"480\" height=\"360\" src=\"https://ytcropper.com/embed/Oq5bfdea0d48fe5/loop/noautoplay/\" frameborder=\"0\" allowfullscreen></iframe><a href=\"/\" target=\"_blank\">via ytCropper</a>",
    "<iframe width=\"480\" height=\"360\" src=\"https://ytcropper.com/embed/qc5bfdefb76110f/loop/noautoplay/\" frameborder=\"0\" allowfullscreen></iframe><a href=\"/\" target=\"_blank\">via ytCropper</a>",
    "<iframe width=\"480\" height=\"360\" src=\"https://ytcropper.com/embed/4G5bfdf1f7dc8d2/loop/noautoplay/\" frameborder=\"0\" allowfullscreen></iframe><a href=\"/\" target=\"_blank\">via ytCropper</a>",
    "<iframe width=\"480\" height=\"360\" src=\"https://ytcropper.com/embed/V05bfdf34e08807/loop/noautoplay/\" frameborder=\"0\" allowfullscreen></iframe><a href=\"/\" target=\"_blank\">via ytCropper</a>",
    "<iframe width=\"480\" height=\"360\" src=\"https://ytcropper.com/embed/dJ5bfdfb906c1ef/loop/noautoplay/\" frameborder=\"0\" allowfullscreen></iframe><a href=\"/\" target=\"_blank\">via ytCropper</a>",
    "<iframe width=\"480\" height=\"360\" src=\"https://ytcropper.com/embed/XV5bfdfc5b50593/loop/noautoplay/\" frameborder=\"0\" allowfullscreen></iframe><a href=\"/\" target=\"_blank\">via ytCropper</a>",
    "<iframe width=\"480\" height=\"360\" src=\"https://ytcropper.com/embed/6E5bfdfd0756a4e/loop/noautoplay/\" frameborder=\"0\" allowfullscreen></iframe><a href=\"/\" target=\"_blank\">via ytCropper</a>"];

    for (let i = 0; i < top10titles.length; i++) {
        let movie = {
            'title': top10titles[i],
            'bechdel': null,
            'rank': i + 1,
            'boxOffice': top10BoxOffice[i],
            'analysis': top10Analysis[i],
            'clips': top10clips[i]
        };

        let testIndex = 0;
        while (movie['bechdel'] === null) {
            let currMovie = top10bechdelTests[testIndex];
            if (currMovie['movie'] === movie['title']) {
                movie['bechdel'] = +currMovie['bechdel'] === 0;
            }
            testIndex++;
        }

        let castData = [];
        for (let j = 0; j < top10castGender.length; j++) {
            let currActor = top10castGender[j];
            // exception for Rogue One (title discrepancy)
            if (currActor['MOVIE'] === movie['title'] ||
                (movie['title'] === "Rogue One" && currActor['MOVIE'] === "Rogue One: A Star Wars Story")) {
                let actorData = {
                    'name': currActor['ACTOR'],
                    'gender': currActor['GENDER'].toLowerCase(),
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
        for (let j = 0; j < top10crewGender.length; j++) {
            let currCrew = top10crewGender[j];
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
                'speakingTurns': +character['speaking_turns'],
                'role': character['role']
            };
            dialogueData.push(characterData);
        }
        movie['dialogueData'] = dialogueData;
        top10Data.push(movie);
    }

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

        if (movie['year'] > 1980) {
            alltimeData.push(movie);
        }
    }

    createVis();
}

function createVis() {
    var areachartBrush = {};

    areachart = new StackedAreaChart("time-area-chart", alltimeData, areachartBrush);
    var casticonchart = new IconChart("cast-icon-chart", top10Data[0]['castData'], top10Data[0], "cast-icon-chart-error");
    var crewiconchart = new IconChart("crew-icon-chart", top10Data[0]['crewData'], top10Data[0], "crew-icon-chart-error");
    var castdialoguechart = new BubbleChart("cast-dialogue-chart", top10Data[0]['dialogueData']);
    genrechart = new StackedBarChart("time-genre-bar-chart", alltimeData);
    var barchart2016 = new BarChart2016("top-10-bar-chart", top10Data, casticonchart, crewiconchart);

    $(areachartBrush).bind("selectionChanged", function(event, rangeStart, rangeEnd){
        genrechart.onSelectionChange(rangeStart, rangeEnd);
    });
}

function updateAxes() {
    areachart.wrangleData();
    genrechart.wrangleData();
}

function showQOne() {
    $("#first-question").fadeIn(2000);
    $("#guess").fadeIn(2000);
    document.getElementById('bottom-view-1').scrollIntoView({ behavior: 'smooth', block: 'start', });
}

function showQTwo() {
    $("#second-question").fadeIn(2000);
    $("#guess-two").fadeIn(2000);
    document.getElementById('end-second').scrollIntoView({ behavior: 'smooth', block: 'start', });
}

function showVis() {
    var answer = document.getElementById('number-input').value;
    console.log(answer);
    console.log((Number.isInteger(answer)));
    if((answer < 0 || answer > 10) || (answer === "")) {
        $("#answer-feedback").html("Please enter a valid integer between 0 and 10.")
    }
    else {
        $("#main-visual").fadeIn();
        $("#show-answer").html("You thought <u>" + answer + "</u> movies or <u>" + (answer * 10) + "%</u> of the top 10 grossing films from 2016 passed the Bechdel Test. <b>Here is what 2016 actually looked like. </b>");
        document.getElementById('top-view').scrollIntoView({ behavior: 'smooth', block: 'start', });
    }
}

function showVisTwo() {
    var answer = document.getElementById('year-input').value;

    if((answer < 1980 || answer > 2013) || (answer === "")) {
        $("#answer-feedback-2").html("Please enter a year between 1980 and 2013.")
    }
    else {
        $("#main-visual-2").fadeIn();
        $("#show-answer-2").html("You thought <u>" + answer + "</u> was the first year where at least half of the films passed the Bechdel test. The correct answer is 1993, which is <u>" + Math.abs(1993 - answer) + "</u> years off from your prediction." );
        document.getElementById('topViewTwo').scrollIntoView({ behavior: 'smooth', block: 'start', });
    }

}

var vid = document.getElementById("intro-vid");
vid.onended = function() {
    $("#intro-vid").fadeOut("slow");
    $("#full-intro").fadeIn("slow");
    document.getElementById('full-intro').scrollIntoView({ behavior: 'smooth', block: 'start', });
};