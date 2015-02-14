// Variables

var margin = { top: 50, right: 50, bottom: 50, left: 50 },
	width = 1739 - margin.left - margin.right,
	height = 963 - margin.top - margin.bottom;

var format = d3.time.format("%Y");

var x = d3.scale.ordinal()
	.rangeRoundBands([0, width], .1);

var x1 = d3.time.scale()
	.range([0, width]);

var y = d3.scale.linear()
	.range([height, 0]);

var xAxis = d3.svg.axis()
	.scale(x)
	.orient("bottom");

var yAxis = d3.svg.axis()
	.scale(y)
	.orient("left");

var xAxis1 = d3.svg.axis()
	.scale(x1)
	.ticks(d3.time.years)
	.orient("top");

var chart = d3.select("#barchart").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var tip = d3.tip()
	  .attr('class', 'd3-tip')
	  .offset([-10, 0])
	  .html(function (d) {
		  return "<strong>Medal:</strong> <span style='color:red'>" + d.Total + "</span><br/>" +
				 "<strong>Country:</strong> <span style='color:red'>" + d.Country + "</span><br/>" +
				 "<strong>Year:</strong> <span style='color:red'>" + d.Year + "</span><br/>" +
				 "<strong>Season:</strong> <span style='color:red'>" + d.Season + "</span>";
	  })


var checkMedal = document.getElementById("medal");
var summerBtn = document.getElementById("defaultSeason");
var winterBtn = document.getElementById("winterSeason");
var year = document.getElementById("yearList");


var dropDown = d3.select("#yearList");
// year lists for summer olympics in dataset
var summerYear = ["1900","1904","1908","1912","1920","1924","1928","1932","1936","1948","1952","1956","1960","1964","1968",
				  "1972","1976","1980","1984","1988","1992","1996","2000","2004","2008"];
// year lists for winter olympics in dataset
var winterYear = ["1924","1928","1932","1936","1948","1952","1956","1960","1964","1968","1972","1976","1980","1984","1988",
				  "1992","1994","1998","2002","2006"];

// Functions

function init() {
	chart.call(tip);

	d3.csv("data/olympics.csv", function (d) {
		Total = +d.Total;
		Year = format.parse(d.Year).getFullYear();
		Gold = +d.Gold;
		Silver = +d.Silver;
		Bronze = +d.Bronze;
		Season = d.Season;
		return {
			Total: Total,
			Country: d.Country,
			Year: Year,
			Gold: Gold,
			Silver: Silver,
			Bronze: Bronze,
			Season: Season
		};
	}, function (error, rawData) {
		var defaultData = rawData;
		var winterData = rawData;
		// default condition: year = 1900, season = summer, medal = all
		defaultData = defaultData.filter(function (row) {
			return row["Year"] == "1900" && row["Season"] == "Summer" && row["Total"] > 0;
		});

		dropDown.selectAll("option")
				.data(summerYear)
				.enter()
				.append("option")
				.text(function (d) { return d; })
				.attr("value", function (d) { return d; });


		//console.log(defaultData);
		draw(defaultData);

		///////////////////////// Page Controls /////////////////////////////

		// winter season
		d3.select("#winterSeason").on("change", function () {
			dropDown.selectAll("option").remove();
			var options = dropDown.selectAll("option")
									.data(winterYear)
									.enter()
									.append("option");
			options.text(function (d) { return d; })
					.attr("value", function (d) { return d; })

			winterData = winterData.filter(function (row) {
				return row["Year"] == "2006" && row["Season"] == "Winter" && row["Total"] != 0;
			});
			console.log(winterData);
			// console.log(winterData);
			draw(winterData);
		});

		// summer season
		d3.select("#defaultSeason").on("change", function () {
			dropDown.selectAll("option").remove();
			var options = dropDown.selectAll("option")
								  .data(summerYear)
								  .enter()
								  .append("option");
			options.text(function (d) { return d; })
				   .attr("value", function (d) { return d; })
			draw(defaultData);
		});

		// update graph based on medal and season
		d3.select("#medal").on("change", function () {

			for (var i = 0; i < checkMedal.length; i++) {
				if (checkMedal.options[i].selected) {
					var medalVal = checkMedal.options[i].value;
					if (summerBtn.checked) {
						var summer = summerBtn.value;
						updateMedal(medalVal, summer, year.options[year.selectedIndex].value);
					} else if (winterBtn.checked) {
						var winter = winterBtn.value;
						updateMedal(medalVal, winter, year.options[year.selectedIndex].value);
					}
				}
			}
		});

		// update year
		dropDown.on("change", function () {
			var season;
			if (summerBtn.checked) {
				season = summerBtn.value;
			} else if (winterBtn.checked) {
				season = winterBtn.value;
			}
			updateMedal(checkMedal.options[checkMedal.selectedIndex].value, season, year.options[year.selectedIndex].value);

		});
	});
}

/* Function to draw bar chart using d3 lib
 * @author Xuchen Cheng
 * @param data -- array of objects read from olympics.csv file
*/

function draw (data){	

	x.domain(data.map(function (d) { return d.Country }));
	y.domain([0, d3.max(data, function (d) { return d.Total })]);

	chart.select(".x.axis").remove();

	chart.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," +height+")")
		.call(xAxis)
		.selectAll("text")
		.attr("dx", "-1em")
		.attr("dy", "-.55em")
		.attr("transform", function(d){
			return "rotate(-90)";
		})
		.style("text-anchor","end");

	
	chart.select(".y.axis").remove();

	chart.append("g")
		.attr("class", "y axis")
		.call(yAxis)
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y",6)
		.attr("dy", ".71em")
		.style("text-anchor","end")
		.text("Total Number of Medals");

	var bar = chart.selectAll(".bar")
				.data(data);
	//new data
	bar.enter().append("rect")
			   .attr("class", "bar")
			   .attr("x", function(d){return x(d.Country); })
			   .attr("width", x.rangeBand())
			   .attr("y", function(d){return y(d.Total);})
			   .attr("height", function(d){return height - y(d.Total);});
	
	//remove data
	bar.exit().remove();
	//update data
	bar.transition().duration(750)
					.attr("x", function(d){return x(d.Country); })
					.attr("width", x.rangeBand())
					.attr("y", function(d){return y(d.Total);})
					.attr("height", function(d){return height - y(d.Total);});



	// show tip when hover over bars on graph
	d3.selectAll(".bar").on('mouseover',tip.show);
	// hide tip after mouse hover on bars
	d3.selectAll(".bar").on('mouseout',tip.hide);

	d3.select("#sort").on("change", sortByMedalVal);

	/*
	 * function to sort columns by medal values in descending order
	*/
	function sortByMedalVal() {

		// Copy-on-write since tweens are evaluated after a delay.
		var x0 = x.domain(data.sort(this.checked
			? function(a, b) { return b.Total - a.Total; }
			: function(a, b) { return d3.ascending(a.Country, b.Country); })
			.map(function(d) { return d.Country; }))
			.copy();

		var transition = chart.transition().duration(750),
			delay = function(d, i) { return i * 50; };

		transition.selectAll(".bar")
			.delay(delay)
			.attr("x", function(d) { return x0(d.Country); });

		transition.select(".x.axis")
			.call(xAxis)
		  .selectAll("g")
			.delay(delay)
				  .selectAll("text")  
				.style("text-anchor", "end")
				.attr("dx", "-1em")
				.attr("dy", "-.55em")
				.attr("transform", function(d) {
					return "rotate(-90)" 
					});
		}
}


/* Function to update graph based on information currently presented on the page
 * @author Xuchen Cheng
 * @param medalVal -- current selected value from medal dropdown list
 * @param season   -- current checked value from season
 * @param year     -- current selected value from year dropdown list
*/
function updateMedal(medalVal, season, year) {
	// switch cases on type of medal
	switch(medalVal.toUpperCase()) {	
		case "GOLD":
			d3.csv("data/olympics.csv", function (d) {
				Year = format.parse(d.Year).getFullYear();		
				Gold = +d.Gold;												
				Season = d.Season;							
					return {
						Country:d.Country,	
						Year: Year,								
						Total: Gold,
						Season: Season									
					};
					},	function(error, rawData){
					rawData = rawData.filter(function(row){
					return row["Year"] == year && row["Season"] == season && row["Total"] > 0;
					});									
					draw(rawData);
				});
				break;
		case "SILVER":
			d3.csv("data/olympics.csv", function (d) {
				Year = format.parse(d.Year).getFullYear();											
				Silver = +d.Silver;											
				Season = d.Season;	
					return {
						Country:d.Country,	
						Year: Year,								
						Total: Silver,
						Season: Season									
					};
					},	function(error, rawData){
					rawData = rawData.filter(function(row){
					return row["Year"] == year && row["Season"] == season && row["Total"] > 0;
					});									
					draw(rawData);
				});
				break;
		case "BRONZE":
			d3.csv("data/olympics.csv", function (d) {
				Year = format.parse(d.Year).getFullYear();	
				Bronze = +d.Bronze;		
				Season = d.Season;								
					return {
						Country:d.Country,	
						Year: Year,								
						Total: Bronze,
						Season: Season									
					};
					},	function(error, rawData){
					rawData = rawData.filter(function(row){
					return row["Year"] == year && row["Season"] == season && row["Total"] > 0;
					});									
					draw(rawData);
					});
					break;
		case "ALL":
			d3.csv("data/olympics.csv", function (d) {
				Total = +d.Total;
				Year = format.parse(d.Year).getFullYear();													
				Season = d.Season;	
					return {
						Country:d.Country,	
						Year: Year,								
						Total: Total,
						Season: Season									
					};
					},	function(error, rawData){
					rawData = rawData.filter(function(row){
					return row["Year"] == year&& row["Season"] == season && row["Total"] > 0;
					});									
					draw(rawData);
				});
				break;
	}	

}


init();






