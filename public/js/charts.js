// Core code from: http://jsfiddle.net/gh/get/jquery/1.9.1/highslide-software/highcharts.com/tree/master/samples/highcharts/demo/dynamic-update/
function displayLineChart(socket){
    var score;
    socket.on('sentiment',function(msg){
        score = msg.score;
    });


    $('#lineChart').highcharts({
        chart: {
            type: 'spline',
            animation: Highcharts.svg, // don't animate in old IE
            marginRight: 10,
        },
        title: {
            text: 'Real-time Sentiment'
        },
        xAxis: {
            type: 'datetime',
            tickPixelInterval: 150
        },
        yAxis: {
            title: {
                text: 'Sentiment Score'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
            formatter: function () {
                return '<b>' + this.series.name + '</b><br/>' +
                    Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                    Highcharts.numberFormat(this.y, 2);
            }
        },
        legend: {
            enabled: false
        },
        exporting: {
            enabled: false
        },
        series: [{
            name: 'Sentiment Score',
            data: []
        }]
    });
}


$(document).ready(function () {
    "use strict";
    $('#stop').hide();

    var socket = io.connect("http://localhost:3000");
    
    //displaySemiDonut(val);

    var donut = new Highcharts.Chart({
        chart: {
             renderTo: 'semiDonut',
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false
        },
        title: {
            text: 'Sentiment',
        },
        tooltip: {
            formatter: function() {
                return '<b>'+ this.point.name +'</b>: '+ this.percentage.toFixed(1) +' %';
            }
        },
        plotOptions: {
            pie: {
                allowPointSelect: false,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    color: '#000000',
                    connectorColor: '#000000',
                    formatter: function() {
                        return '<b>'+ this.point.name +'</b>: '+ this.percentage.toFixed(1) +' %';
                    }
                }
            }
        },
        series: [{
            type: 'pie',
            name: 'Distribution',
            data: [
                ['Neutral', 4], 
                ['Positive', 3],
                ['Negative', 3]             
            ]
        }]
    });


    var lineChart = new Highcharts.Chart({
        chart: {
            renderTo: 'lineChart',
            defaultSeriesType: 'spline'
        },
        title: {
            text: 'Real time sentiment score'
        },
        xAxis: {
            type: 'datetime',
            tickPixelInterval: 150,
            maxZoom: 20 * 1000
        },
        yAxis: {
            minPadding: 0.2,
            maxPadding: 0.2,
            title: {
                text: 'Value',
                margin: 80
            }
        },
        series: [{
            name: 'Sentiment Score',
            data: []
        }]
    });        


    $("#searchForm").on("submit", function(evt) {
        evt.preventDefault();
        var topic = $('#topic').val();
        socket.emit("topic", topic);
        $('#stop').show();
        $('#search').hide();
    });

    $("#stopForm").on("submit", function(evt) {
        evt.preventDefault();
        socket.emit("stopStreaming", "dummy");
        $('#stop').hide();
        $('#search').show();
    });


    socket.on("data", function(data) {
        console.log(data);

        donut.series[0].setData([
            ['Neutral',data.neu],   
            ['Positive',data.pos],
            ['Negative', data.neg]           
        ]);
        var series = lineChart.series[0];
        var shift = series.data.length > 50;
        var score = (data.pos - data.neg) / (data.pos + data.neg);
        var x = (new Date()).getTime(); // current time
        console.log(x);
        var y = data.currentScore;
        $("#tweet").html(data.tweet);
        lineChart.series[0].addPoint( [x,y], true, shift); 
    });

   // displayLineChart(socket);
});

