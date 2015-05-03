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
            events: {
                load: function () {

                    // set up the updating of the chart each second
                    var series = this.series[0];
                    setInterval(function () {
                        var x = (new Date()).getTime(), // current time
                            y = score;
                        series.addPoint([x, y], true, true);
                    }, 1000);
                }
            }
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
            name: 'Random data',
            data: (function () {
                // generate an array of random data
                var data = [],
                    time = (new Date()).getTime(),
                    i;

                for (i = -19; i <= 0; i += 1) {
                    data.push({
                        x: time + i * 1000,
                        y: Math.random()
                    });
                }
                return data;
            }())
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
    });

   // displayLineChart(socket);
});

