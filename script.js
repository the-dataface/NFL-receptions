//window width and height
var windowW = window.innerWidth;
var windowH = window.innerHeight;

var margin_right;
var large_screen = false;
var medium_screen = false;
var small_screen = false;

if (windowW > 1000) {
    margin_right = windowW * .2;
    h = windowH * 1.5;
    large_screen = true;
} else if (windowW > 650) {
    margin_right = windowW * .3;
    h = windowH * 1.5;
    medium_screen = true;
} else {
    margin_right = 50;
    h = windowH * 1;
    small_screen = true;
}
var w = windowW;

var margin = {
    top: 105,
    right: margin_right,
    bottom: 100,
    left: 50
};

w = w - margin.left - margin.right;
h = h - margin.top - margin.bottom;

/*

//building legend
var legendScale = d3.scaleOrdinal()
                .domain(["Active Player", "Retired Player"])
                .range([ "rgb(153, 107, 195)", "rgb(56, 106, 197)"]);
svg.append("g")
   .attr("class", "legendOrdinal")

var legendOrdinal = d3.legendColor()
  .shape("path", d3.symbol().type(d3.symbolTriangle).size(150)())
  .shapePadding(10)
  .scale(legendScale);

svg.select(".legendOrdinal")
   .call(legendOrdinal);

*/

//defining variables
var dataset, xScale, yScale, xAxis, yAxis, line;

//convert column names and strings to floats
var rowConverter = function(d) {
    return {
        identifier: d['player_link'],
        name: d['Player Name'],
        game: parseInt(d['Career Games']),
        catches: parseInt(d['Career Catches']),
        season: parseInt(d['Season']),
        active: d['Active']
    };
}

d3.csv("https://the-dataface.github.io/NFL-receptions/top20_players_FINAL.csv", rowConverter, function(data) {

   d3.select("div.chart-header")
     .attr("width", w + "px");
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
        active = values[0].active;
        if (active == "Active") {
          seasons_played = "(" + values[0].season + " - Present)";
        } else {
          seasons_played = "(" + values[0].season + " - " + values[length].season + ")";
        }

        player_info["index"] = index;
        player_info["name"] = name;
        player_info["games"] = games;
        player_info["catches"] = catches;
        player_info["seasons_played"] = seasons_played;
        key_info_pairs[key] = player_info;

        name_key_pairs[name_lowercase] = key;

        names.push(name);
    }

    if (large_screen) {
      annotation_names = ["Jarvis Landry", "Jerry Rice", "Odell Beckham", "Marvin Harrison",
                          "Larry Fitzgerald", "Antonio Brown"];
      annotation_coordinates = {
        jarvis_landry:[[45, 470],[52, 430],[57, 349]],
        jerry_rice:[[291, 1670],[298, 1630],[303, 1549]],
        odell_beckham:[[35, 434],[42, 394],[47, 313]],
        marvin_harrison:[[178, 1223],[185, 1183],[190, 1102]],
        larry_fitzgerald:[[199, 1306],[206, 1266],[211, 1185]],
        antonio_brown:[[99, 823],[106, 783],[111, 702]]
      };
    } else if (medium_screen) {
      annotation_names = ["Jarvis Landry", "Jerry Rice", "Odell Beckham", "Marvin Harrison",
                          "Larry Fitzgerald", "Antonio Brown"];
      annotation_coordinates = {
        jarvis_landry:[[45, 510],[58, 450],[57, 349]],
        jerry_rice:[[291, 1670],[298, 1630],[303, 1549]],
        odell_beckham:[[35, 434],[42, 394],[47, 313]],
        marvin_harrison:[[178, 1223],[185, 1183],[190, 1102]],
        larry_fitzgerald:[[199, 1306],[206, 1266],[211, 1185]],
        antonio_brown:[[99, 823],[106, 783],[111, 702]]
      };
    } else if (small_screen) {
      annotation_names = ["Jarvis Landry", "Jerry Rice", "Marvin Harrison",
                          "Larry Fitzgerald", "Antonio Brown"];
      annotation_coordinates = {
        jarvis_landry:[[45, 510],[58, 450],[57, 349]],
        jerry_rice:[[291, 1670],[298, 1630],[303, 1549]],
        odell_beckham:[[35, 434],[42, 394],[47, 313]],
        marvin_harrison:[[178, 1223],[185, 1183],[190, 1102]],
        larry_fitzgerald:[[199, 1306],[206, 1266],[211, 1185]],
        antonio_brown:[[99, 823],[106, 783],[111, 702]]
      };
    }


    //scale for x-axis - update with dataset
    var xScale = d3.scaleLinear()
        .domain([0,
            d3.max(dataset, function(d) {
                return d.game;
            }) + 10
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
        .tickValues([0, 99, 199, 299]);

    //y-axis
    var yAxis = d3.axisLeft()
        .scale(yScale)
        .tickSize(-w)
        .tickFormat(function(d) {
            if (d == 0) {
                return " ";
            } else if (d == 1400) {
                return d + " catches";
            } else {
              return d;
            }
        });

    //create svg
    var svg = d3.select("div.container")
        .append("svg")
        .attr("width", "100%")
        .attr("height", h + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //set up line generators
    var line = d3.line()
        .x(function(d) {
            return xScale(d.game);
        })
        .y(function(d) {
            return yScale(d.catches);
        })
        .curve(d3.curveStepBefore);

    //create lines
    var paths = svg.selectAll("path")
        .data(nested)
        .enter()
        .append("path")
        .attr("class", "line")
        .attr("d", function(d) {
            return line(d.values);
        })
        .style("stroke", function(d) {
            var final_year = d.values[d.values.length - 1].season;
            if (final_year == 2017) {
              return "#6699CC";
            } else {
              return "#DCDCDC";
            }
        });

    //mousover line effects
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

                for (i in annotation_names) {
                  if (!existing_annotation(annotation_names[i])) {
                    create_annotation(annotation_names[i]);
                  }
                };

                if (in_annotation_list(name)) {
                  remove_annotation(name);
                };

                create_line_and_label(d, name, game, catches, seasons_played);
            });
    });

    //mouseout line effects
    paths.on("mouseout touchend", function() {
        d3.select(this)
          .style("stroke-width", "3")
          .each(function(d) {
              key = d.key;
              name = key_info_pairs[key].name;

              if (in_annotation_list(name)) {
                create_annotation(name);
              };
          });

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

    //y axis customization
    function customYAxis(g) {
        //var s = g.selection ? g.selection() : g;
        g.call(yAxis);
        g.select(".domain").remove();
        g.selectAll(".tick line").attr("stroke", "#777").attr("stroke-width", .1);
        g.selectAll(".tick text").attr("x", 20).attr("dy", -4).attr("font-family", "Mada").attr("font-size", "13px");
    }

    //x axis customization
    function customXAxis(g) {
        //var s = g.selection ? g.selection() : g;
        g.call(xAxis);
        g.select(".domain").remove();
        g.selectAll(".tick text").attr("font-family", "Mada").attr("font-size", "13px");
    }

    //search bar functionality
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

                            if (in_annotation_list(name)) {
                              remove_annotation(name);
                            };

                            create_line_and_label(player_data, name, game, catches, seasons_played);
                        }
                        results_container.classed("search-bar-results-shown", false);
                    });
            }
        })

    //function to create line and label
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

    //annotation line generation
    var annotationLine = d3.line()
        .x(function(d) {
            return xScale(d[0]);
        })
        .y(function(d) {
            return yScale(d[1]);
        })
        .curve(d3.curveCardinal);

    //function to create annotation
    var create_annotation = function(name) {
      i = 0;
      found_name = false;

      while (i < annotation_names.length) {
        if (annotation_names[i] == name) {
          found_name = true;
          i++;
        } else {
          i++;
        }
      }

      if (found_name) {
        name_label = name.split(' ').join('_').toLowerCase();

        this_player_coordinates = annotation_coordinates[name_label];

        this_player_path = svg.append("path")
                              .attr("class", name_label + " annotationPath")
                              .attr("d", annotationLine(this_player_coordinates));

        this_player_label = svg.append("text")
                              .attr("class", name_label + " annotationText")
                              .text(name)
                              .attr("x", xScale(this_player_coordinates[0][0]))
                              .attr("y", yScale(this_player_coordinates[0][1] + 10));
      }
    };

    //function to check if player should be annotated
    var in_annotation_list = function(name) {
      i = 0;
      while (i < annotation_names.length) {
        if (annotation_names[i] == name) {
          return true;
        } else {
          i++;
        }
      }
      return false;
    };

    //function to check if annotation exists or is hidden
    var existing_annotation = function(name) {
      name_label = name.split(' ').join('_').toLowerCase();
      path = d3.select("path." + name_label);
      if (path.empty()) {
        return false;
      } else {
        return true;
      }
    };

    //function to remove annotation
    var remove_annotation = function(name) {
      name_label = name.split(' ').join('_').toLowerCase();
      d3.select("path." + name_label).remove();
      d3.select("text." + name_label).remove();
    };

    for (i in annotation_names) {
      create_annotation(annotation_names[i]);
    }

    //building legend
    var svg_legend = d3.select("div.legend-container")
						.append("svg")
						.style("width", "100%")
						.style("height", "100%");

    var legendScale = d3.scaleOrdinal()
                    .domain(["Active Player", "Retired Player"])
                    .range([ "#6699CC", "#DCDCDC"]);

    svg_legend.append("g")
       .attr("class", "legendOrdinal")
       .attr("transform", "translate(15,10)");

    var legendOrdinal = d3.legendColor()
      .shape("path", d3.symbol().type(d3.symbolSquare).size(300)())
      .shapePadding(10)
      .scale(legendScale);

    svg_legend.select(".legendOrdinal")
       .call(legendOrdinal);

    d3.selectAll("text.label")
      .attr("font-weight", 300);


});
