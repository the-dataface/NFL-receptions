//window width and height
var windowW = window.innerWidth;
var windowH = window.innerHeight;

var margin_right;
var small_screen = false;

if (windowW > 1000) {
    margin_right = windowW * .2;
    h = windowH * 1.5;
} else if (windowW > 650) {
    margin_right = windowW * .3;
    h = windowH * 1.5;
} else {
    margin_right = 50;
    h = windowH * 1;
    small_screen = true;
}
var w = windowW;

var margin = {
    top: 50,
    right: margin_right,
    bottom: 100,
    left: 50
};

w = w - margin.left - margin.right;
h = h - margin.top - margin.bottom;

d3.select("div.chart-header")
    .attr("width", w + "px");

//defining variables
var dataset, xScale, yScale, xAxis, yAxis, line;

//convert column names and strings to floats
var rowConverter = function(d) {
    return {
        identifier: d['player_link'],
        name: d['Player Name'],
        game: parseInt(d['Career Games']),
        catches: parseInt(d['Career Catches']),
        season: parseInt(d['Season'])
    };
}

d3.csv("https://the-dataface.github.io/NFL-receptions/top20_players_FINAL.csv", rowConverter, function(data) {

    //dataset
    var dataset = data;

    //nested dataset
    var nested = d3.nest()
        .key(function(d) {
            return d.identifier;
        })
        .entries(dataset);
    /*
    var catch_name = []

    for (item in nested) {
      var catch_array = nested[item].values;
      var final_game = catch_array[catch_array.length - 1];
      catch_name.push({
        key: final_game.catches,
        value: final_game.name
      });
    }
    */
    var key_info_pairs = [];
    var name_key_pairs = [];
    var names = [];

    for (index in nested) {
        player_info = [];
        values = nested[index].values;
        length = values.length - 1;

        key = nested[index].key;
        index = index;
        name = values[0].name;
        name_lowercase = values[0].name.toLowerCase()
        games = values[length].game;
        catches = values[length].catches;
        seasons_played = "(" + values[0].season + " - " + values[length].season + ")";

        player_info["index"] = index;
        player_info["name"] = name;
        player_info["games"] = games;
        player_info["catches"] = catches;
        player_info["seasons_played"] = seasons_played;
        key_info_pairs[key] = player_info;

        name_key_pairs[name_lowercase] = key;

        names.push(name);
    }

    //scale for x-axis - update with dataset
    var xScale = d3.scaleLinear()
        .domain([0,
            d3.max(dataset, function(d) {
                return d.game;
            })
        ])
        .range([0, w]);

    //scale for x-axis - update with dataset
    var yScale = d3.scaleLinear()
        .domain([0,
            d3.max(dataset, function(d) {
                return d.catches;
            })
        ])
        .range([h, 0]);


    var colorScaleR = d3.scaleLinear()
        .domain([0,
            d3.max(dataset, function(d) {
                return d.catches;
            })
        ])
        .range([198, 0]);

    var colorScaleG = d3.scaleLinear()
        .domain([0,
            d3.max(dataset, function(d) {
                return d.catches;
            })
        ])
        .range([58, 0]);

    //x-axis
    var xAxis = d3.axisBottom()
        .scale(xScale)
        //.tickValues([0, 19, 39, 59, 79, 99, 119, 139, 159, 179, 199, 219, 239, 259, 279, 299])
        .tickFormat(function(d) {
            var game = d + 1;
            var last_digit = game % 10;
            if (game == 1) {
                return "1st game";
            } else if (last_digit == 1) {
                return game + "st";
            } else if (last_digit == 2) {
                return game + "nd";
            } else if (last_digit == 3) {
                return game + "rd";
            } else {
                return game + "th";
            }
        })
        .tickValues([0, 99, 199, 299])

    //y-axis
    var yAxis = d3.axisLeft()
        .scale(yScale)
        .tickSize(-w)
        .tickFormat(function(d) {
            if (d == 0) {
                return " ";
            } else {
                return d;
            }
        });


    //set up line generators
    var line = d3.line()
        .x(function(d) {
            return xScale(d.game);
        })
        .y(function(d) {
            return yScale(d.catches);
        })
        .curve(d3.curveStepBefore);

    var svg = d3.select("div.container")
        .append("svg")
        .attr("width", w + margin.right)
        .attr("height", h + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var paths = svg.selectAll("path")
        .data(nested)
        .enter()
        .append("path")
        .attr("class", "line")
        .attr("d", function(d) {
            return line(d.values);
        })
        .style("stroke", function(d) {
            var max = d.values[d.values.length - 1].catches;
            var r = Math.round(colorScaleR(max)) + 14;
            var g = Math.round(colorScaleG(max)) + 170;

            rgb = "rgb(" + r + "," + g + ",255)";
            return rgb;
        });

    paths.transition()
        .duration(200);

    paths.on("mouseover touchstart", function(d) {
        d3.select("text.playerLabel").remove();
        d3.select("text.playerSubLabel").remove();
        d3.select("rect.playerLabelBox").remove();
        d3.select("path.lineThin").remove();

        var key;
        var name;
        var catches;
        var game;
        var seasons_played;
        //fix this
        d3.select(this)
            .style("stroke-width", "4")
            .each(function(d) {
                key = d.key;
                name = key_info_pairs[key].name;
                game = key_info_pairs[key].games;
                catches = key_info_pairs[key].catches;
                seasons_played = key_info_pairs[key].seasons_played;

                create_line_and_label(d, name, game, catches, seasons_played);
            });
    });


    paths.on("mouseout touchend", function() {
        d3.select(this)
            .style("stroke", function(d) {
                var max = d.values[d.values.length - 1].catches;
                var r = Math.round(colorScaleR(max)) + 14;
                var g = Math.round(colorScaleG(max)) + 170;

                rgb = "rgb(" + r + "," + g + ",255)";

                return rgb;
            })
            .style("stroke-width", 3);

        d3.select("text.playerLabel").remove();
        d3.select("text.playerSubLabel").remove();
        d3.select("rect.playerLabelBox").remove();
        d3.select("path.lineThin").remove();
    });

    //generate axes
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + h + ")")
        .call(customXAxis);

    svg.append("g")
        .call(customYAxis);

    function customYAxis(g) {
        //var s = g.selection ? g.selection() : g;
        g.call(yAxis);
        g.select(".domain").remove();
        g.selectAll(".tick line").attr("stroke", "#777").attr("stroke-width", .1);
        g.selectAll(".tick text").attr("x", 4).attr("dy", -4).attr("font-family", "Mada").attr("font-size", "13px");
    }

    function customXAxis(g) {
        //var s = g.selection ? g.selection() : g;
        g.call(xAxis);
        g.select(".domain").remove();
        g.selectAll(".tick text").attr("font-family", "Mada").attr("font-size", "13px");
    }

    d3.select(".search-bar")
        .on("keyup", function() {

            results_container = d3.select(".search-bar-results");

            results_container.classed("search-bar-results-shown", false);

            d3.selectAll(".search-bar-results-result").remove()

            entry = d3.select(".search-bar").node().value.toLowerCase();
            matches = [];

            for (i in names) {
                name_lowerCase = names[i].toLowerCase();
                name = names[i];
                if (name_lowerCase.startsWith(entry)) {
                    matches.push(name);
                }
            }

            if (matches.length <= 5 && matches.length > 0) {

                results_container.classed("search-bar-results-shown", true);

                results_container.selectAll("p")
                    .data(matches)
                    .enter()
                    .append("p")
                    .attr("class", "search-bar-results-result")
                    .text(function(d) {
                        return d;
                    })
                    .on("click", function(d) {
                        player = d.toLowerCase();
                        key = name_key_pairs[player];
                        if (key) {
                            index = key_info_pairs[key].index;
                            player_data = nested[index];
                            name = key_info_pairs[key].name;
                            catches = key_info_pairs[key].catches;
                            game = key_info_pairs[key].games;
                            seasons_played = key_info_pairs[key].seasons_played;

                            create_line_and_label(player_data, name, game, catches, seasons_played);
                        }
                        results_container.classed("search-bar-results-shown", false);
                    });
            }
        })


    var create_line_and_label = function(data_set, name, game, catches, seasons_played) {
        d3.select("text.playerLabel").remove();
        d3.select("text.playerSubLabel").remove();
        d3.select("rect.playerLabelBox").remove();
        d3.select("path.lineThin").remove();

        svg.append("path")
            .attr("class", "lineThin")
            .attr("d", line(data_set.values));

        svg.append("rect")
            .attr("class", "playerLabelBox");

        svg.append("text")
            .attr("class", "playerLabel")
            .text(name + " " + seasons_played)
            .attr("x", xScale(game) + 17)
            .attr("y", yScale(catches) - 5)
            .attr("pointer-events", "none")
            .filter(function() {
                return small_screen
            })
            .attr("x", xScale(game))
            .attr("text-anchor", "end");

        svg.append("text")
            .attr("class", "playerSubLabel")
            .text(catches + " catches, " + game + " games")
            .attr("x", xScale(game) + 17)
            .attr("y", yScale(catches) + 15)
            .attr("pointer-events", "none")
            .filter(function() {
                return small_screen
            })
            .attr("x", xScale(game))
            .attr("text-anchor", "end");

        var bboxPlayerLabel = d3.select("text.playerLabel").node().getBBox();
        var widthPlayerLabel = bboxPlayerLabel.width;
        var heightPlayerLabel = bboxPlayerLabel.height;

        var bboxSubPlayerLabel = d3.select("text.playerSubLabel").node().getBBox();
        var widthSubPlayerLabel = bboxSubPlayerLabel.width;
        var heightSubPlayerLabel = bboxSubPlayerLabel.height;

        var height = heightPlayerLabel + heightSubPlayerLabel;
        var width = Math.max(widthPlayerLabel, widthSubPlayerLabel);

        d3.select("rect.playerLabelBox")
            .attr("width", width + 10)
            .attr("height", height)
            .attr("x", xScale(game) + 12)
            .attr("y", yScale(catches) - heightPlayerLabel)
            .attr("fill", "white")
            .attr("opacity", .8)
            .attr("pointer-events", "none")
            .filter(function() {
                return small_screen
            })
            .attr("x", xScale(game) - width - 5)
            .attr("y", yScale(catches) - heightPlayerLabel);

        if ((xScale(game) - width - 5) < 30) {
            d3.select("text.playerLabel").attr("x", xScale(0)).attr("text-anchor", "start");
            d3.select("text.playerSubLabel").attr("x", xScale(0)).attr("text-anchor", "start");
            d3.select("rect.playerLabelBox").attr("x", xScale(0));
        }
    };

    const type = d3.annotationCalloutElbow;

      const annotations = [{
      note: {
      title: "Jarvis Landry"
    },
    //can use x, y directly instead of data
    data: { game: 70, catches: 275 },
    dy: -50,
    dx: -50
  }].map(function(d){ d.color = "#000000"; return d})

  const makeAnnotations = d3.annotation()
    .type(type)
    //accessors & accessorsInverse not needed
    //if using x, y in annotations JSON
    .accessors({
      x: d => xScale(d.game),
      y: d => yScale(d.catches)
    })
    .annotations(annotations);

  d3.select("svg")
    .append("g")
    .attr("class", "annotation-group")
    .call(makeAnnotations)
    .style("font-family", 'Mada');

});
