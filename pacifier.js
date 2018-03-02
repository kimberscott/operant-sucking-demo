var baselineSucks = [];
var baselineBursts = [];
var baselineBurstTimes = [];
var baselineMedian = 0;
var tic = 0;
var baselinerecording = false; // Not recording
var baselineTime = 0;

var conditionSucks = [];
var conditionBursts = [];
var conditionBurstTimes = [];
var condTic = 0;
var conditioning = false;
var conditionTime = 0;

var timer1 = 0;
var timer2 = 0;

var burstThreshold = 2000; //ms

$(document).ready(function () {
		main_pacifier();
});

function main_pacifier() {

	
	loadSounds() ;
	
// Initial state of buttons (baseline)
	$('#beginbaseline').removeAttr('disabled');
	$('#clearbaseline').attr('disabled', 'disabled');
	$('#endbaseline').attr('disabled', 'disabled');
	$('#baselinesuck').attr('disabled', 'disabled');
	updateBaselineStatus();
	
// Generate the empty charts to start with
	updateBaselineChart();
	updateConditionChart();
	
// Set the conditioning section to disabled initially (when no baseline data)
	disableConditioning();
	
// Add handlers for baseline buttons
	$('#beginbaseline').click(beginBaselineHandler);
	$('#endbaseline').click(endBaselineHandler);
	$('#clearbaseline').click(clearBaselineHandler);
	$('#baselinesuck').click(baselineSuckHandler);
	
// Add handlers for condition buttons
	$('#conditionsuck').click(conditionSuckHandler);
	$('#begincondition').click(beginConditionHandler);
	$('#endcondition').click(endConditionHandler);
	$('#listensound1').click(sampleAudio1);
	$('#listensound2').click(sampleAudio2);


function baselineSuckHandler() {
	// Play a brief sound to confirm
	$('#buttonsound')[0].play();
	if(tic!=-1) {
		var thisSuck = (new Date()) - tic;
		baselineSucks.push(thisSuck);
		baselineTime += thisSuck;
		
		if(thisSuck > burstThreshold){
			baselineBursts.push(thisSuck/1000);
			baselineBurstTimes.push(baselineTime/1000);
			baselineMedian = median(baselineBursts);
			
			Highcharts.charts[0].series[0].addPoint([baselineBurstTimes[baselineBurstTimes.length-1], baselineBursts[baselineBursts.length-1]]);
			Highcharts.charts[0].redraw();
		}
	}
	tic = new Date();
	updateBaselineStatus();
}



function clearBaselineHandler() {
	baselineSucks = [];
	baselineTime = 0;
	baselineBursts = [];
	baselineBurstTimes = [];
	baselineMedian = 0;
	updateBaselineStatus();
	$('#graphcontainer1').html('');
	updateBaselineChart();
	disableConditioning();
}

function beginBaselineHandler() {
	tic = -1;
	baselinerecording = true;
	updateBaselineStatus();
	disableConditioning();
	$('#beginbaseline').attr('disabled', 'disabled');
	$('#clearbaseline').attr('disabled', 'disabled');
	$('#endbaseline').removeAttr('disabled');
	$('#baselinesuck').removeAttr('disabled');
}
function endBaselineHandler() {
	baselinerecording = false;
	updateBaselineStatus();
	
	$('#endbaseline').attr('disabled', 'disabled');
	$('#baselinesuck').attr('disabled', 'disabled');
	$('#beginbaseline').removeAttr('disabled');
	$('#clearbaseline').removeAttr('disabled');
	
	if(baselineMedian !=0) {
		enableConditioning();
		updateConditionChart();
	}
}

function updateBaselineStatus() {
	var statusstring='';
	if(baselinerecording) {
		statusstring = '<p>Taking baseline measurement.</p>';
		$('#baselinestatus').addClass('recording');
	} else {
		$('#baselinestatus').removeClass('recording');
	}
	
	if(baselineSucks.length>0) {
		statusstring += '<p> ' + Math.round(baselineTime/1000) + ' seconds of baseline data';
	}else{
		statusstring += '<p>No baseline data yet';
	}
	
	if(baselineTime/1000 > 120) {
		$('#baselinestatus').addClass('ready');
		statusstring += ' (ready!) ';
	} else {
		$('#baselinestatus').removeClass('ready');
		if(baselinerecording){
		statusstring += ' (keep going!) ';}
	}
	
	$('#baselinestatustext').html(statusstring);
}

function updateBaselineChart() {

	var baselineData = [];
	for(i=0; i<baselineBursts.length; i++) {
		baselineData.push([baselineBurstTimes[i], baselineBursts[i]]);
	}
	
	var xmax = 120;
	var ymax = 20;
	if(baselineBursts.length>0) {
		xmax = Math.max(xmax, baselineBurstTimes[baselineBurstTimes.length-1]); 
		ymax = Math.max(ymax, Math.max.apply(null, baselineBursts));
	}
	
	baselineChart = {
        chart: {
            type: 'line'
        },
        title: {
            text: 'Baseline'
        },
        yAxis: {
            title: {
                text: 'Seconds between bursts'
            },
			min: 0,
			max: ymax,
        },
		xAxis: {
			title: {
				text: 'Time (seconds)'
			},
			min:0,
			max: xmax
		},
		legend: {
            enabled: false
        },
        series: [{
			id: 'baselineseries',
			name: 'Times between bursts',
            data: baselineData
        }, ],
    };

	baselineChartObj = $('#graphcontainer1').highcharts(baselineChart);
}

function updateConditionChart() {
	var conditionData = [];
	for(i=0; i<conditionBursts.length; i++) {
		conditionData.push([conditionBurstTimes[i], conditionBursts[i]]);
	}
	
	var xmax = 120;
	var ymax = 20;
	if(conditionBursts.length>0) {
		xmax = Math.max(xmax, conditionBurstTimes[conditionBurstTimes.length-1]); 
		ymax = Math.max(ymax, Math.max.apply(null, conditionBursts));
	}
	
	var labelText1 = '';
	var labelText2 = '';
	if(baselineMedian > 0) {
		labelText1 = $( "#sound1 :selected").text();
		labelText2 = $( "#sound2 :selected").text();
	}

	conditionChart = {
        chart: {
            type: 'line'
        },
        title: {
            text: 'Conditioning'
        },
        yAxis: {
            title: {
                text: 'Seconds between bursts'
            },
			min:0,
			max: ymax,
			plotBands: {
				color: 'yellow', // Color value
				from: '0', // Start of the plot band
				to: baselineMedian, // End of the plot band
			}		
        },
		xAxis: {
			title: {
				text: 'Time (seconds)'
			},
			min:0,
			max: xmax
		},
		legend: {
            enabled: false
        },
        series: [{
			name: 'Times between bursts',
            data: conditionData
        }, 
		{	
			name: 'Baseline median IBI',
			data: [[0, baselineMedian], [xmax, baselineMedian]]
			}
		],
    };

	$('#graphcontainer2').highcharts(conditionChart);

}

function median(arr) {
 
 lst = arr.slice(0);
	lst.sort();
	var halflen = Math.floor(lst.length/2);
	if(lst.length % 2){
		return lst[halflen];
	} else {
		return (lst[halflen-1] + lst[halflen]) / 2.0;
	}
}

function disableConditioning() {
	$('#conditiondiv *').attr('disabled', 'disabled');
	$('#conditiondiv .innerdiv').addClass('inactive');
}

function enableConditioning() {
	$('#conditiondiv *').removeAttr('disabled');
	$('#endcondition').attr('disabled', 'disabled');
	$('#conditionsuck').attr('disabled', 'disabled');
	$('#conditiondiv .innerdiv').removeClass('inactive');
}

function disableBaseline() {
	$('#baselinediv *').attr('disabled', 'disabled');
	$('#baselinediv .innerdiv').addClass('inactive');
}

function enableBaseline() {
	$('#baselinediv *').removeAttr('disabled');
	$('#endbaseline').attr('disabled', 'disabled');
	$('#baselinesuck').attr('disabled', 'disabled');
	$('#baselinediv .innerdiv').removeClass('inactive');
}

function loadSounds() {
	var options = $('#sound1 option');
	for(i=0; i<options.length; i++) {
		var soundid = options[i].value;
		$('#'+soundid)[0].load();
	}
}

function conditionSuckHandler() {
	// Play a brief sound to confirm
	$('#buttonsound')[0].play();
	if(condTic!=-1) {
		var thisSuck = (new Date()) - condTic;
		conditionSucks.push(thisSuck);
		conditionTime += thisSuck;
		
		if(thisSuck > burstThreshold){
			conditionBursts.push(thisSuck/1000);
			conditionBurstTimes.push(conditionTime/1000);
			
			if(thisSuck/1000 < baselineMedian) { // play sound 1
				$('#'+$( "#sound1").val())[0].play();
				timer = setTimeout(function() { $('#'+$( "#sound1").val())[0].pause(); $('#'+$( "#sound2").val())[0].pause(); }, burstThreshold);
				
			} else { // play sound 2
				$('#'+$( "#sound2").val())[0].play();
				timer = setTimeout(function() { $('#'+$( "#sound1").val())[0].pause(); $('#'+$( "#sound2").val())[0].pause(); }, burstThreshold);
			}
			
			var index=$("#graphcontainer2").data('highchartsChart');
			Highcharts.charts[index].series[0].addPoint([conditionBurstTimes[			conditionBurstTimes.length-1], conditionBursts[conditionBursts.length-1]]);
			Highcharts.charts[index].redraw();
		} else {
			clearTimeout(timer);
			timer = setTimeout(function() { $('#'+$( "#sound1").val())[0].pause(); $('#'+$( "#sound2").val())[0].pause(); }, burstThreshold);
		}
		
		
		
	}
	condTic = new Date();
	updateConditionStatus();
}

function beginConditionHandler() {
	condTic = -1;
	conditioning = true;
	updateConditionStatus();
	disableBaseline();
	$('#'+$( "#sound2").val())[0].play(); // start with slow-suck sound
	$('#begincondition').attr('disabled', 'disabled');
	$('#listensound1').attr('disabled', 'disabled');
	$('#listensound2').attr('disabled', 'disabled');
	$('#endcondition').removeAttr('disabled');
	$('#conditionsuck').removeAttr('disabled');
}
function endConditionHandler() {
	conditioning = false;
	$('#'+$( "#sound1").val())[0].pause();
	$('#'+$( "#sound2").val())[0].pause();
	updateConditionStatus();
	enableBaseline();
	
	$('#endcondition').attr('disabled', 'disabled');
	$('#conditionsuck').attr('disabled', 'disabled');
	$('#listensound1').removeAttr('disabled');
	$('#listensound2').removeAttr('disabled');
	$('#begincondition').removeAttr('disabled');
}

function updateConditionStatus() {
	var statusstring='';
	if(conditioning) {
		statusstring = 'Conditioning!';
		$('#conditionstatus').addClass('recording');
	} else {
		$('#conditionstatus').removeClass('recording');
	}
	
	if(conditionBursts.length>0) {
		if (conditionBursts[conditionBursts.length -1] > baselineMedian) {
			statusstring += ' <p> Last inter-burst interval was LONGER than baseline ';
		} else {
			statusstring += ' <p> Last inter-burst interval was SHORTER than baseline ';
		}
		
	}else{
		statusstring += '<p>No conditioning data yet';
	}
	
	$('#conditionstatustext').html(statusstring);
}

function sampleAudio1() {
	$('#'+$( "#sound1").val())[0].play();
	$('#listensound1').attr('disabled', 'disabled');
	setTimeout(function(){$('#'+$( "#sound1").val())[0].pause(); $('#listensound1').removeAttr('disabled')},3000);
}

function sampleAudio2() {
	$('#'+$( "#sound2").val())[0].play();
	$('#listensound2').attr('disabled', 'disabled');
	setTimeout(function(){$('#'+$( "#sound2").val())[0].pause();  $('#listensound2').removeAttr('disabled')},3000);
}

}