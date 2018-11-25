WordCloud = function(_parentElement, _isPass){
    this.parentElement = _parentElement;
    this.isPass = _isPass;
    this.initVis();
}

WordCloud.prototype.initVis = function() {
    var vis = this;

    var margin = {top: 30, right: 50, bottom: 30, left: 50};
    var width = 960 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;

    var path = this.isPass ? "data/top10_data/dialogue/bechdelpass.txt" : "data/top10_data/dialogue/bechdelfail.txt";

    jQuery.get(path, function(data) {

        // Sequence borrowed from blocks
        var common = "i,me,my,myself,we,us,our,ours,ourselves,you,your,yours,yourself,yourselves,he,him,his,himself,she,her,hers,herself,it,its,itself,they,them,their,theirs,themselves,what,which,who,whom,whose,this,that,these,those,am,is,are,was,were,be,been,being,have,has,had,having,do,does,did,doing,will,would,should,can,could,ought,i'm,you're,he's,she's,it's,we're,they're,i've,you've,we've,they've,i'd,you'd,he'd,she'd,we'd,they'd,i'll,you'll,he'll,she'll,we'll,they'll,isn't,aren't,wasn't,weren't,hasn't,haven't,hadn't,doesn't,don't,didn't,won't,wouldn't,shan't,shouldn't,can't,cannot,couldn't,mustn't,let's,that's,who's,what's,here's,there's,when's,where's,why's,how's,a,an,the,and,but,if,or,because,as,until,while,of,at,by,for,with,about,against,between,into,through,during,before,after,above,below,to,from,up,upon,down,in,out,on,off,over,under,again,further,then,once,here,there,when,where,why,how,all,any,both,each,few,more,most,other,some,such,no,nor,not,only,own,same,so,than,too,very,say,says,said,shall";

        var word_count = {};

        var words = data.split(/[ '\-\(\)\*":/\n/;\[\]|{},.!?]+/);
        if (words.length == 1){
            word_count[words[0]] = 1;
        } else {
            words.forEach(function(word){
                var word = word.toLowerCase();
                if (word != "" && common.indexOf(word)==-1 && word.length>1){
                    if (word_count[word]){
                        word_count[word]++;
                    } else {
                        word_count[word] = 1;
                    }
                }
            })
        }

        var color = d3.scaleOrdinal(d3.schemeCategory20);

        var xScale = d3.scaleLinear()
            .domain([0, d3.max(data, function(d) {
                return d.value;
            })
            ])
            .range([10,100]);

        var word_entries = d3.entries(word_count);

        var xScale = d3.scaleLinear()
            .domain([0, d3.max(word_entries, function(d) {
                return d.value;
            })
            ])
            .range([10,100]);


        var fontSize = d3.scalePow().exponent(5).domain([0, 1]).range([40, 80]);


        var layout = d3.layout.cloud()
            .timeInterval(20)
            .words(word_entries)
            .fontSize(function(d) { return xScale(+d.value); })
            .fontWeight(["bold"])
            .text(function(d) { return d.key; })
            .rotate(function() { return ~~(Math.random() * 2) * 90; })
            .font("Impact")
            .spiral("rectangular") // "archimedean" or "rectangular"
            .on("end", draw)
            .start();



        function draw(words) {
            d3.select("#" + vis.parentElement).append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + [150, 200] + ")")
                .selectAll("text")
                .data(words)
                .enter().append("text")
                .style("font-size", function(d) { return xScale(d.value) + "px"; })
                .style("font-family", "Impact")
                .style('fill',function(d, i) { return color(i); })
                .attr("text-anchor", "middle")
                .attr("transform", function(d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .text(function(d) { return d.key; });
        }

        d3.layout.cloud().stop();
    });

};