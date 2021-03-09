//workflow: turn every entry in the log file into a logLine Object
//then use queueEntry objects to pack and unpack these items, so that the playlist never ends :DDDDDDDD

var queueIndex = new Array();
var queueEntryId = 0;
var queueContainer = document.getElementById("queue");
var mosasaYTPlayer;
//var log = new Array();

class queueEntry {
	constructor(logLineObject) {
		this.lineData = logLineObject;
		queueIndex.push(this);
		this.create_entry();
		this.add_log_info(); //wip
	}

	create_entry() {
		this.create_entry_div()
		this.populate_entry_div()
		this.add_log_buttons()
	}

	replace_player_src() {
		//var embeddedURL = "https://www.youtube.com/embed/" + this.lineData.url + "?autoplay=1";
		//document.getElementById("player").setAttribute("src",embeddedURL);
		mosasaYTPlayer.loadVideoById(this.lineData.url);
	}

	remove_from_queue() {
		var pos = this.get_queueIndex_pos();
		queueIndex.splice(pos,1);
		queueContainer.removeChild(this.entryDiv);
	}

	add_to_queue() {
		queueIndex.push(this);
		queueContainer.appendChild(this.entryDiv);
	}

	shift_in_queue(index) { //fixing
		var previousPos = this.get_queueIndex_pos();
		if (index < previousPos) {previousPos += 1;}
		queueIndex.splice(index,0,this);
		if (index >= queueIndex.length-1) {
			queueContainer.appendChild(this.entryDiv);
		}
		else {
		var beforeDiv = queueIndex[index + 1].entryDiv;
		queueContainer.insertBefore(this.entryDiv,beforeDiv);
		}
		queueIndex.splice(previousPos,1);
	}

	get_queueIndex_pos() {
		return queueIndex.indexOf(this);
	}

	create_entry_div() {
		queueEntryId += 1
		this.entryDiv = document.createElement("div")
		this.entryDivId = "entry-" + queueEntryId
		this.entryDiv.setAttribute("id",this.entryDivId)
		this.entryDiv.setAttribute("class","entry-div")
		queueContainer.appendChild(this.entryDiv)
	}

	populate_entry_div() {
		this.entryTitle = document.createElement("a")
		this.entryTitle.setAttribute("class","entry-title")
		this.entryTitle.setAttribute("href","https://www.youtube.com/watch/" + this.lineData.url);
		this.entryTitle.setAttribute("target","_blank");
		var entryTitleText = document.createTextNode(this.lineData.title)
		this.entryTitle.appendChild(entryTitleText)
		this.entryDiv.appendChild(this.entryTitle)
	}

	add_log_buttons() {
		this.buttonDiv = document.createElement("div");
		this.buttonDiv.setAttribute("class","entry-btn-div");
		this.buttonDiv.setAttribute("id",this.entryDivId + "btn-div");
		this.entryDiv.appendChild(this.buttonDiv);
		this.add_play_button();
		this.add_order_buttons();
	}

	add_play_button() {
		this.playButton = document.createElement("button");
		this.playButton.setAttribute("type","button");
		this.playButton.setAttribute("class","entry-btn");
		this.playButton.setAttribute("id", this.entryDivId + "-play-btn");
		this.playButton.setAttribute("onclick","play_entry(\"" + this.entryDivId + "\")"); //this one will be tricky to figure out I think.
		this.playButton.appendChild(document.createTextNode("Play"));
		this.buttonDiv.appendChild(this.playButton);
	}

	add_order_buttons() {
		this.orderUpButton = document.createElement("button");
		this.orderUpButton.setAttribute("type","button");
		this.orderUpButton.setAttribute("class","entry-btn");
		this.orderUpButton.setAttribute("id", this.entryDivId + "-order-up-btn");
		this.orderUpButton.setAttribute("onclick","move_entry(\"" + this.entryDivId + "\",\"up\",1)");
		this.orderUpButton.appendChild(document.createTextNode("Move up"));
		this.buttonDiv.appendChild(this.orderUpButton);

		this.orderDownButton = document.createElement("button");
		this.orderDownButton.setAttribute("type","button");
		this.orderDownButton.setAttribute("class","entry-btn");
		this.orderDownButton.setAttribute("id", this.entryDivId + "-order-down-btn");
		this.orderDownButton.setAttribute("onclick","move_entry(\"" + this.entryDivId + "\",\"down\",1)");
		this.orderDownButton.appendChild(document.createTextNode("Move down"));
		this.buttonDiv.appendChild(this.orderDownButton);
	}

	add_log_info() {
		//wip
	}
}

class logLine {
	constructor(logLine) { //don't need to push to global index since an entry is made right after this object is made.
		this.line = logLine;
		this.get_indeces();
		this.get_title();
		this.get_url();
	}

	get_indeces() {
		this.titleEndPos = this.line.indexOf("\thttps://www.youtube.com/watch")-1;
		this.youtubeSubURLStartPos = this.line.indexOf("https://www.youtube.com/watch/") + "https://www.youtube.com/watch/".length;
		this.youtubeSubURLEndPos = this.line.indexOf("\n<br>",this.youtubeSubURLStartPos);
	}

	get_title() {
		this.title = this.line.slice(0,this.titleEndPos+1);
	}

	get_url() {
		this.url = this.line.slice(this.youtubeSubURLStartPos); //will have to add handling for urls of other types later, probably will be easier to implement on the server side
	}
}

function get_log() {
	var log = document.getElementById("log").innerHTML;
	var _Line_Pos = 0;
	var _Line_EndPos;
	var next_Line_Pos = 0;
	var _Line_String;
	var logEntryText;
	var length = get_queue_length();
	for (index = 0; index <= length; index++) {
		_Line_Pos = log.indexOf("_LINE_",next_Line_Pos);
		_Line_String = "_LINE_" + index;
		_Line_Pos = _Line_Pos + _Line_String.length;
		next_Line_Pos = log.indexOf("_LINE_",_Line_Pos);
		_Line_EndPos = next_Line_Pos - "\n<br>".length;
		logEntryText = log.slice(_Line_Pos,_Line_EndPos);
		let logLineObject = new logLine(logEntryText);
		let playlistQueueEntry = new queueEntry(logLineObject);
	}
}


function button_test() {
	document.getElementById("queue-test-text").innerHTML = "queueLength is " + get_queue_length();
	autoplay_next_entry();
}

function get_queue_length() {
	var queueLength = document.getElementById("log_length").innerHTML;
	return queueLength;
}

function play_entry(entryDivId) {
	var entry = get_entry_by_id(entryDivId);
	entry.remove_from_queue();
	entry.add_to_queue();
	entry.replace_player_src();
}

function autoplay_next_entry() {
	var nextEntryId = get_end_entry_id("top");
	play_entry(nextEntryId);
}

function shuffle_queue() {
	//loop through each index in queue shifting each one to a new index
	//do this three or so times I guess, to reduce the odds of something not getting shuffled
	//maybe add a shuffled attribute down the line.. idk
	var queueLength = queueIndex.length;
	for (i = 0; i <= 3; i++) {
		for (index = 0; index < queueLength; index++) {
			var randomPos = Math.floor(Math.random() * queueLength);
			queueIndex[index].shift_in_queue(randomPos);
		}
	}
}

function move_entry(entryDivId,direction,number) { //need to add validation so that it checks direction to be either "up" or "down", though this isn't a  big deal
	var moveMod = 0;
	if (direction == "up") {number *= -1;}
	else if (direction == "down") {moveMod = 1;}
	var entry = get_entry_by_id(entryDivId);
	var isEndEntry = is_end_entry_by_id(entryDivId);
	if (isEndEntry == 1 && number < 0) {number = 0;}
	else if (isEndEntry == -1 && number > 0) {number = 0;}
	var queueStartPos = entry.get_queueIndex_pos();
	number = move_distance_in_bounds(queueStartPos,number);
	var queueDestinationPos = queueStartPos + number + moveMod;
	entry.shift_in_queue(queueDestinationPos);
}

function move_distance_in_bounds(currentPos,number) {
	//make sure number is less than or equal to the bounds of the queue
	if (currentPos + number < 0) {number = -1 * currentPos;}
	else if (currentPos + number > queueIndex.length) {number = queueIndex.length - currentPos;}
	return number;
}

//function get_top_entry_id() {
//	var topEntry = document.querySelectorAll("#queue div.entry-div")[0];
//	return topEntry.getAttribute("id");
//}

function is_end_entry_by_id(entryId) {
	var topId;
	topId = get_end_entry_id("top");
	var bottomId;
	botomId = get_end_entry_id("bottom");

	if (entryId == topId) {
		return 1;
	}
	else if (entryId == bottomId) {
		return -1;
	}
	else {
		return 0;
	}
}

function get_end_entry_id(whichEnd) {
	var endIndex;
	var queueEntryNodeList = document.querySelectorAll("#queue div.entry-div");
	switch (whichEnd) {
		case "top":
			endIndex = 0;
			break;
		case "bottom":
			endIndex = queueEntryNodeList.length - 1;
			break;
		default:
			endIndex = 0;
	}

	//var endEntry = document.querySelectorAll("#queue div.entry-div")[endIndex];
	var endEntry = queueEntryNodeList[endIndex];
	var endEntryId = endEntry.getAttribute("id");
	//var endEntryId = document.querySelectorAll("#queue div.entry-div")[endIndex].getAttribute("id");
	return endEntryId
}

function get_entry_by_id(id) {
	for (let entry of queueIndex) {
		if (id == entry.entryDivId) {
			return entry;
		}
		else {
			continue;
		}
	}
	return 0
}
//YOUTUBE BULLSHIT
function load_youtube_iframe_api_script() {
	var tag = document.createElement('script');

	tag.src = "https://www.youtube.com/iframe_api";
      	var firstScriptTag = document.getElementsByTagName('script')[0];
      	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function onYouTubeIframeAPIReady() {
	document.getElementById("queue-test-text").innerHTML = "youtubeAPI ready";
	mosasaYTPlayer = new YT.Player('player', {
		height: '200',
		width: '200',
		videoId: 'FcZOnrL9VKM',
		playerVars: {
			'autoplay': 1,
			'disablekb': 1,
			'origin': 'https://holedigging.club',
			'enablejsapi': 1
			},
		events: {
			'onReady': onPlayerReady,
			'onStateChange': onPlayerStateChange
			}
		});
	document.getElementById("queue-test-text").innerHTML = "mosasaYTPlayer object created";
}

function onPlayerReady(event) {
	document.getElementById("queue-test-text").innerHTML = "onPlayerReady";
	event.target.playVideo();
}

function onPlayerStateChange(event) {
	document.getElementById("queue-test-text").innerHTML = "onPlayerStateChange";
	if (event.data == YT.PlayerState.ENDED) {
		autoplay_next_entry();
	}
}

function stopVideo() {
	mosasaYTPlayer.stopVideo();
}

//YOUTUBE BULLSHIT

function main() {
	load_youtube_iframe_api_script();
	get_log();
}

main()
