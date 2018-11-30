let top10Data = [];
let alltimeData = [];

queue()
    .defer(d3.csv,"data/top10_data/nextBechdel_allTests.csv")
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

function wrangleData(error, top10bechdelTests, top10crewGender,
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
        "Passes all three tests, with flying colors. Judy Hopps, Gazelle, Mrs. Otterton, Judy's Mom, Dharma Armadillo, Fru Fru, and Bellweather have several conversations. *SPOILER ALERT* This video clip reveals the ending.",
        "Passes only two tests. Kaa (the snake) and Raksha (the wolf) do talk to each other, but it's about Mowgli's father.",
        "Passes only two tests. Gidget and Chloe both talk to each other, but only about their male love interests.",
        "Passes only two tests. Lois and Martha talk about the former's relationship with Kent. Jenny also says a total of five words to Lois, but she doesn't respond. In the extended edition, however, there is a deleted scene where they talk.",
        "Passes all three tests, barely. Mary Lou, Modesty, Seraphina, Tina, the MACUSA president, and Newt have brief or dubiously non-male centered conversations.",
        "Passes only one test. The film has a few named female characters such as Vanessa, NTW, and Angel Dust, but they never talk with each other.",
        "Passes all three tests, barely. Amanda Waller, Harleen Quinzel, and June Moone have very brief conversations."];

    let top10clips = ["<iframe width=\"500\" height=\"375\" src=\"https://ytcropper.com/embed/At5bfdda67988ed/loop/noautoplay/\" frameborder=\"0\" allowfullscreen></iframe><a href=\"/\" target=\"_blank\"><br>via ytCropper</a>",
    "<iframe width=\"500\" height=\"375\" src=\"https://www.youtube.com/embed/FQSgnwGsnzg\" frameborder=\"0\" allow=\"accelerometer; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen></iframe>",
    "<iframe width=\"500\" height=\"375\" src=\"https://ytcropper.com/embed/If5bfdeb8534d84/loop/noautoplay/\" frameborder=\"0\" allowfullscreen></iframe><a href=\"/\" target=\"_blank\"><br>via ytCropper</a>",
    "<iframe width=\"500\" height=\"375\" src=\"https://ytcropper.com/embed/Oq5bfdea0d48fe5/loop/noautoplay/\" frameborder=\"0\" allowfullscreen></iframe><a href=\"/\" target=\"_blank\"><br>via ytCropper</a>",
    "<iframe width=\"500\" height=\"375\" src=\"https://ytcropper.com/embed/qc5bfdefb76110f/loop/noautoplay/\" frameborder=\"0\" allowfullscreen></iframe><a href=\"/\" target=\"_blank\"><br>via ytCropper</a>",
    "<iframe width=\"500\" height=\"375\" src=\"https://ytcropper.com/embed/4G5bfdf1f7dc8d2/loop/noautoplay/\" frameborder=\"0\" allowfullscreen></iframe><a href=\"/\" target=\"_blank\"><br>via ytCropper</a>",
    "<iframe width=\"500\" height=\"375\" src=\"https://ytcropper.com/embed/V05bfdf34e08807/loop/noautoplay/\" frameborder=\"0\" allowfullscreen></iframe><a href=\"/\" target=\"_blank\"><br>via ytCropper</a>",
    "<iframe width=\"500\" height=\"375\" src=\"https://ytcropper.com/embed/dJ5bfdfb906c1ef/loop/noautoplay/\" frameborder=\"0\" allowfullscreen></iframe><a href=\"/\" target=\"_blank\"><br>via ytCropper</a>",
    "<iframe width=\"500\" height=\"375\" src=\"https://ytcropper.com/embed/XV5bfdfc5b50593/loop/noautoplay/\" frameborder=\"0\" allowfullscreen></iframe><a href=\"/\" target=\"_blank\"><br>via ytCropper</a>",
    "<iframe width=\"500\" height=\"375\" src=\"https://ytcropper.com/embed/6E5bfdfd0756a4e/loop/noautoplay/\" frameborder=\"0\" allowfullscreen></iframe><a href=\"/\" target=\"_blank\"><br>via ytCropper</a>"];

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

        if (movie['year'] >= 1980) {
            alltimeData.push(movie);
        }
    }

    createVis();
}

function createVis() {
    var vis = this;
    var areachartBrush = {};

    vis.areachart = new StackedAreaChart("time-area-chart", alltimeData, areachartBrush);
    vis.crewiconchart = new IconChart("crew-icon-chart", top10Data[0]['crewData'], top10Data[0], "crew-icon-chart-error");
    vis.castdialoguechart = new BubbleChart("cast-dialogue-chart", top10Data[0]['dialogueData']);
    vis.genrechart = new StackedBarChart("time-genre-bar-chart", alltimeData);
    vis.barchart2016 = new BarChart2016("top-10-bar-chart", top10Data, vis.crewiconchart, vis.castdialoguechart);

    $(areachartBrush).bind("selectionChanged", function(event, rangeStart, rangeEnd){
        vis.genrechart.onSelectionChange(rangeStart, rangeEnd);
    });
}

function updateAxes() {
    var vis = this;

    vis.areachart.wrangleData();
    vis.genrechart.wrangleData();
}

function updateTop10() {
    var vis = this;
    var selectedIndex = d3.select('#movie-select-box').property("value");
    var d = {};
    for (var index in top10Data) {
        if (top10Data[index]['rank'] === +selectedIndex) {
            d = top10Data[index];
            break;
        }
    }
    document.getElementById("top-10-movie-title").innerHTML = "#" + d['rank'] + " " + d['title'];
    document.getElementById("top-10-movie-revenue").innerHTML = "<b>Box Office Revenue</b>: $" +
        d['boxOffice'].toLocaleString() + "M";
    document.getElementById("top-10-movie-bechdel").innerHTML = d['analysis'];
    document.getElementById("top-10-movie-video").innerHTML = d['clips'];
    $("#top-10-detail-area").show();
    vis.crewiconchart.data = d['crewData'];
    vis.crewiconchart.wrangleData();
    vis.castdialoguechart.data = d['dialogueData'];
    vis.castdialoguechart.wrangleData();
}

function showVis() {
    $("#button3").fadeTo(500, 0);
    $("#first-movies").fadeIn();
    $("#top-10-detail-area").hide();
    $("#button35").hide();
    document.getElementById('top-view').scrollIntoView({ behavior: 'smooth', block: 'start', });
}

function showBars() {
    var vis = this;

    vis.barchart2016.revealBars();
}

function checkAnswers() {
    var vis = this;

    document.getElementById("2016-section-title").innerHTML =
        "2016's Top 10 Movies Mostly Passed The Test, But Failed At Larger Representation";
    document.getElementById("click-instruction").innerHTML = "Click any bar to view more details";
    document.getElementById("button2").style.display='none';
    console.log(vis.barchart2016.correctMovies)
    document.getElementById("question1").innerHTML = "You got <u>" + vis.barchart2016.numberCorrect +
        "</u> out of 10 movies correct. Click any bar to view more details about that movie.";
    document.getElementById("correct-movies").innerHTML = "<b>Movies you guessed correctly:</b> " +
        vis.barchart2016.correctMovies.join(', ');
    document.getElementById("incorrect-movies").innerHTML = "<b>Movies you guessed incorrectly:</b> " +
        vis.barchart2016.incorrectMovies.join(', ');
    $("#button35").show();
}

function showDets() {
    $("#button35").fadeTo(500, 0);
    $("#breakdown").fadeIn();
    document.getElementById('breakdown').scrollIntoView({ behavior: 'smooth', block: 'start', });
}


function showQTwo() {
    $("#button4").fadeTo(500, 0);
    $("#second-question").fadeIn(2000);
    $("#guess-two").fadeIn(2000);
    document.getElementById('end-second').scrollIntoView({ behavior: 'smooth', block: 'start', });
}


function showAnswerTwo() {
    var vis = this;

    var answer = document.getElementById('year-input').value;
    if((answer < 1980 || answer > 2013) || (answer === "")) {
        $("#answer-feedback-2").html("Please enter a year between 1980 and 2013.")
    }
    else {
        $("#button5").fadeTo(500, 0);
        $("#answer-two").fadeIn();
        $("#show-answer-2").html("You thought <u>" + answer + "</u> was the first year where at least half of the films passed the Bechdel test. <b>The correct answer is 1993, which is <u>"
            + Math.abs(1993 - answer) + "</u> years off from your prediction.</b> Let's look at how Bechdel test results change over time, from 1980 to 2013." );
        document.getElementById('answer-two').scrollIntoView({ behavior: 'smooth', block: 'end', });
        vis.areachart.guessAnnotation
            .attr("transform", "translate(" + areachart.x(answer) + ", 0)");
        vis.areachart.guessAnnotation.moveToFront();
        vis.areachart.correctText
            .attr("x", function() {
                return (answer > 1993) ? -10 : 10;
            })
            .attr("text-anchor", function() {
                return (answer > 1993) ? "end" : "start";
            })
        vis.areachart.guessText
            .attr("x", function() {
                return ((answer > 1993 && answer < 2011) || answer < 1983) ? 10 : -10;
            })
            .attr("text-anchor", function() {
                return ((answer > 1993 && answer < 2011) || answer < 1983) ? "start" : "end";
            });
    }
}

function showVisTwo() {
    $("#button6").fadeTo(500, 0);
    $("#main-visual-2").fadeIn();
    document.getElementById('topViewTwo').scrollIntoView({ behavior: 'smooth', block: 'start', });
}

function showEnd() {
    $("#button7").fadeTo(500, 0);
    $("#ending").fadeIn();
    document.getElementById('ending').scrollIntoView({ behavior: 'smooth', block: 'start', });
    $("#photo1").fadeIn(2000);
    $("#photo2").fadeIn(2000);
    $("#photo3").fadeIn(2000);
    $("#photo4").fadeIn(2000);
    $("#photo5").fadeIn(2000);
}

var vid = document.getElementById("intro-vid");
function showVid() {
    $("#big-intro").fadeOut("slow");
    $("#intro-vid").fadeIn("slow");
    vid.scrollIntoView({ behavior: 'smooth', block: 'start', });
}

function showYear() {
    $("#range-answer").html(document.getElementById("year-input").value)
}

vid.onended = function() {
    $("#intro-vid").fadeOut("slow");
    $("#full-intro").fadeIn("slow");
    document.getElementById('full-intro').scrollIntoView({ behavior: 'smooth', block: 'start', });
};

// $("#year-input").on("input change", function() { $("#range-answer").html(document.getElementById("year-input").value); });
